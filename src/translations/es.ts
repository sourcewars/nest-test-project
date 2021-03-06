import {messages as defaultMessage} from './es/default';
import {messages as login} from './es/login';
import {messages as user} from './es/user';
import {messages as userRegister​​} from './es/user.register';

export const messages = {
    default: defaultMessage,
    login,
    user: {
        ...user,
        register: userRegister,
    },
};
