/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { TodoModal } from './components/TodoModal';
import { Loader } from './components/Loader';
import { getTodos, getUser } from './api';
import { Todo } from './types/Todo';
import { User } from './types/User';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const loadTodos = async () => {
      setLoading(true);
      const data = await getTodos();

      setTodos(data);
      setFilteredTodos(data); // Ініціалізація з усіма todos
      setLoading(false);
    };

    loadTodos();
  }, []);

  useEffect(() => {
    if (selectedTodo) {
      const loadUser = async () => {
        setUserLoading(true);
        const userData = await getUser(selectedTodo.userId);

        setUser(userData);
        setUserLoading(false);
      };

      loadUser();
    } else {
      setUser(null);
    }
  }, [selectedTodo]);

  useEffect(() => {
    // Дебаг для перевірки оновлення
  }, [filteredTodos]);

  const handleShowTodo = (todo: Todo) => {
    setSelectedTodo(todo);
  };

  const handleCloseModal = () => {
    setSelectedTodo(null);
  };

  const handleFilterStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const status = event.target.value;

    setFilterStatus(status);
    applyFilters(status, searchQuery);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;

    setSearchQuery(query);
    applyFilters(filterStatus, query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    applyFilters(filterStatus, '');
  };

  const applyFilters = (status: string, query: string) => {
    let filtered = [...todos]; // Копія масиву для фільтрації

    if (status === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    } else if (status === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    }

    if (query) {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(query.toLowerCase()),
      );
    }

    setFilteredTodos(filtered); // Гарантуємо оновлення стану
  };

  return (
    <>
      <div className="section">
        <div className="container">
          <div className="box">
            <h1 className="title">Todos:</h1>

            <div className="block">
              <TodoFilter
                status={filterStatus}
                query={searchQuery}
                onStatusChange={handleFilterStatus}
                onSearch={handleSearch}
                onClear={handleClearSearch}
              />
            </div>

            <div className="block">
              {loading && <Loader />}
              {!loading && (
                <TodoList
                  todos={filteredTodos}
                  onShow={handleShowTodo}
                  selectedTodo={selectedTodo}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <TodoModal
        todo={selectedTodo}
        user={user}
        loading={userLoading}
        onClose={handleCloseModal}
      />
    </>
  );
};
