import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://localhost:7113';

export function signIn() {
    const payload = JSON.stringify({
        emailOrUserName: 'player1',
        password: '123456@'
    });

    const res = http.post(`${BASE_URL}/api/Auth/SignIn`, payload, {
        headers: { 'Content-Type': 'application/json' }
    });

    check(res, {
        'login 200': (r) => r.status === 200,
    });

    return res.json().token;
}