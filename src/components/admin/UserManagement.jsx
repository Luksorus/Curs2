import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../api/axios';
import { getImageUrl } from '../../config';

const Container = styled.div`
  padding: 2rem;
`;

const UsersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-top: 2rem;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover {
    background: #f8f9fa;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: #495057;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RoleSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;

  &:hover {
    border-color: #adb5bd;
  }

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  background: #dc3545;
  color: white;

  &:hover {
    background: #c82333;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/api/users/${userId}/role`, { role: newRole });
      fetchUsers(); 
      setError(null);
    } catch (err) {
      setError('Ошибка при обновлении роли пользователя');
      console.error('Error updating user role:', err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      await api.delete(`/api/users/${userId}`);
      fetchUsers();     
      setError(null);
    } catch (err) {
      setError('Ошибка при удалении пользователя');
      console.error('Error deleting user:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <Container>
      <h2>Управление пользователями</h2>
      <UsersTable>
        <thead>
          <tr>
            <th>Пользователь</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Дата регистрации</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Avatar>
                    {user.avatar ? (
                      <img src={getImageUrl(user.avatar)} alt={user.name} />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </Avatar>
                  {user.name}
                </div>
              </td>
              <td>{user.email}</td>
              <td>
                <RoleSelect
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="user">Пользователь</option>
                  <option value="guide">Гид</option>
                  <option value="admin">Администратор</option>
                </RoleSelect>
              </td>
              <td>{formatDate(user.created_at)}</td>
              <td>
                <Button onClick={() => handleDelete(user.id)}>
                  Удалить
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </UsersTable>
    </Container>
  );
};

export default UserManagement; 