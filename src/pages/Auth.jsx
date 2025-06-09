import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { login, register } from '../store/slices/authSlice';
import { theme } from '../styles/theme';

const Container = styled.div`
  max-width: 500px;
  margin: 4rem auto;
  padding: 2.5rem;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.large};
`;

const Title = styled.h1`
  color: ${theme.colors.text};
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: ${theme.colors.primary};
    border-radius: ${theme.borderRadius.small};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  padding: 1rem;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 1rem;
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &::placeholder {
    color: ${theme.colors.textLight};
  }
`;

const FileInput = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 1rem 2rem;
  background: ${theme.colors.secondary};
  color: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  font-weight: 500;
  transition: all ${theme.transitions.fast};
  border: 2px solid ${theme.colors.primary};
  
  &:hover {
    background: ${theme.colors.primary};
    color: white;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const PreviewImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.circle};
  border: 3px solid ${theme.colors.primary};
  padding: 3px;
`;

const Button = styled.button`
  padding: 1rem;
  background: ${theme.gradients.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all ${theme.transitions.fast};
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.medium};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${theme.colors.textLight};
    cursor: not-allowed;
    transform: none;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1.5rem;
  text-decoration: underline;
  transition: color ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.primaryDark};
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  background: ${theme.colors.error}10;
  padding: 1rem;
  border-radius: ${theme.borderRadius.medium};
  text-align: center;
  margin-bottom: 1rem;
  border: 1px solid ${theme.colors.error}30;
`;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  console.log('Auth component render:', {
    isLogin,
    formData,
    loading,
    error,
    authState: useSelector(state => state.auth)
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверяем тип файла
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Пожалуйста, выберите изображение в формате JPEG, PNG или GIF');
        e.target.value = '';
        return;
      }

      // Проверяем размер файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const action = await dispatch(login(formData));
        if (!action.error) {
          navigate('/profile');
        }
      } else {
        // Создаем FormData для отправки файла
        const registerData = new FormData();
        registerData.append('name', formData.name);
        registerData.append('email', formData.email);
        registerData.append('password', formData.password);
        
        // Добавляем файл только если он был выбран
        if (selectedFile) {
          registerData.append('avatar', selectedFile);
        }

        console.log('Registering with data:', {
          name: formData.name,
          email: formData.email,
          hasFile: !!selectedFile,
          fileName: selectedFile?.name
        });

        const action = await dispatch(register(registerData));
        if (!action.error) {
          navigate('/profile');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', { name, value });
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Container>
      <Title>
        {isLogin ? 'Вход' : 'Регистрация'}
      </Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <Input
              type="text"
              name="name"
              placeholder="Имя"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <FileInput>
              {previewUrl && (
                <PreviewImage src={previewUrl} alt="Preview" />
              )}
              <FileInputLabel>
                {selectedFile ? 'Изменить фото' : 'Выбрать фото'}
                <HiddenInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </FileInputLabel>
            </FileInput>
          </>
        )}

        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />

        <Input
          type="password"
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleInputChange}
          required
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
        </Button>
      </Form>

      <ToggleButton
        type="button"
        onClick={() => {
          setIsLogin(!isLogin);
          setSelectedFile(null);
          setPreviewUrl(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      >
        {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
      </ToggleButton>
    </Container>
  );
};

export default Auth; 