-- Удаление существующих таблиц
DROP TABLE IF EXISTS order_tours CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS tours CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Создание таблицы пользователей
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  avatar VARCHAR(255),
  position VARCHAR(255),
  description TEXT,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы туров
CREATE TABLE tours (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  duration INTEGER NOT NULL,
  distance DECIMAL(10,2),
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(255),
  guide_id INTEGER REFERENCES users(id),
  total_slots INTEGER NOT NULL DEFAULT 10,
  available_slots INTEGER NOT NULL DEFAULT 10,
  date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы заказов
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  tour_id INTEGER REFERENCES tours(id) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы тур-заказ
CREATE TABLE order_tours (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  tour_id INTEGER REFERENCES tours(id),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов
CREATE INDEX idx_tours_guide_id ON tours(guide_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_tour_id ON orders(tour_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_tours_order_id ON order_tours(order_id);
CREATE INDEX idx_order_tours_tour_id ON order_tours(tour_id);

-- Добавление внешних ключей
ALTER TABLE tours 
  ADD CONSTRAINT fk_tours_guide 
  FOREIGN KEY (guide_id) 
  REFERENCES users(id) 
  ON DELETE SET NULL;

ALTER TABLE orders 
  ADD CONSTRAINT fk_orders_user 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

ALTER TABLE orders 
  ADD CONSTRAINT fk_orders_tour 
  FOREIGN KEY (tour_id) 
  REFERENCES tours(id) 
  ON DELETE CASCADE;

ALTER TABLE order_tours 
  ADD CONSTRAINT fk_order_tours_order 
  FOREIGN KEY (order_id) 
  REFERENCES orders(id) 
  ON DELETE CASCADE;

ALTER TABLE order_tours 
  ADD CONSTRAINT fk_order_tours_tour 
  FOREIGN KEY (tour_id) 
  REFERENCES tours(id) 
  ON DELETE CASCADE;

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггеров для обновления updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Создание базовых администраторов
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@example.com', '$2b$10$rR3CQkxQPFKH8.OG/FZKVeAGz8KZbHUYNf3XQwMwzYA4P4z6UAOxq', 'admin'),
('Guide 1', 'guide1@example.com', '$2b$10$rR3CQkxQPFKH8.OG/FZKVeAGz8KZbHUYNf3XQwMwzYA4P4z6UAOxq', 'guide'),
('Guide 2', 'guide2@example.com', '$2b$10$rR3CQkxQPFKH8.OG/FZKVeAGz8KZbHUYNf3XQwMwzYA4P4z6UAOxq', 'guide'),
('User 1', 'user1@example.com', '$2b$10$rR3CQkxQPFKH8.OG/FZKVeAGz8KZbHUYNf3XQwMwzYA4P4z6UAOxq', 'user');

ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  phone = EXCLUDED.phone; 