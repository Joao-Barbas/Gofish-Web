import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = 'https://localhost:7113';

export const users = [
    { username: 'player1', password: '123456@' },
    { username: 'player2', password: '123456@' },
    { username: 'player3', password: '123456@' },
    { username: 'player4', password: '123456@' },
    { username: 'player5', password: '123456@' },
    { username: 'player6', password: '123456@' },
    { username: 'player7', password: '123456@' },
    { username: 'player8', password: '123456@' },
    { username: 'player9', password: '123456@' },
    { username: 'player10', password: '123456@' },
    { username: 'player11', password: '123456@' },
    { username: 'player12', password: '123456@' },
    { username: 'player13', password: '123456@' },
    { username: 'player14', password: '123456@' },
    { username: 'player15', password: '123456@' },
    { username: 'player16', password: '123456@' },
    { username: 'player17', password: '123456@' },
    { username: 'player18', password: '123456@' },
    { username: 'player19', password: '123456@' },
    { username: 'player20', password: '123456@' }

];

export function signIn(user) {
    const res = http.post(`${BASE_URL}/api/Auth/SignIn`, JSON.stringify({
        emailOrUserName: user.username,
        password: user.password
    }), {
        headers: { 'Content-Type': 'application/json' }
    });

    check(res, {
        'login 200': (r) => r.status === 200,
    });

    return res.json().token;
}