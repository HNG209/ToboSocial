// hooks/useGlobalNotification.js
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { showNotification } from '../redux/notification/notificationSlice';

const useGlobalNotification = () => {
  const dispatch = useDispatch();

  const notify = useCallback(
    ({ message = '', description = '', type = 'info', showProgress = true, pauseOnHover = true }) => {
      dispatch(
        showNotification({
          message,
          description,
          type,
          showProgress,
          pauseOnHover,
        })
      );
    },
    [dispatch]
  );

  // Tạo các method shortcut
  const success = useCallback(
    (message, description = '') => {
      notify({ message, description, type: 'success' });
    },
    [notify]
  );

  const error = useCallback(
    (message, description = '') => {
      notify({ message, description, type: 'error' });
    },
    [notify]
  );

  const info = useCallback(
    (message, description = '') => {
      notify({ message, description, type: 'info' });
    },
    [notify]
  );

  const warning = useCallback(
    (message, description = '') => {
      notify({ message, description, type: 'warning' });
    },
    [notify]
  );

  return {
    notify,
    success,
    error,
    info,
    warning,
  };
};

export default useGlobalNotification;
