import http from 'k6/http';
import { check, sleep } from 'k6';
import { signIn } from '../auth.js';

export const options = {
    stages: [
        { duration: '30s', target: 20 },
        { duration: '30s', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 150 },
        { duration: '30s', target: 200 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.05'],
        http_req_duration: ['p(95)<1500'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'https://localhost:7113';

export function setup() {
    const token = signIn();
    return { token };
}

export default function (data) {
    const res = http.get(`${BASE_URL}/api/Group/GetUserGroups`, {
        headers: {
            'Authorization': `Bearer ${data.token}`,
        },
    });

    let body = null;

    try {
        body = res.json();
    } catch (e) {
        body = null;
    }

    check(res, {
        'getUserGroups status 200': (r) => r.status === 200,
        'response has body': (r) => r.body && r.body.length > 0,
        'content-type is json': (r) =>
            r.headers['Content-Type'] &&
            r.headers['Content-Type'].includes('application/json'),
        'body parsed': () => body !== null,
        'body has data property': () => body !== null && body.data !== undefined,
        'data is array': () => body !== null && Array.isArray(body.data),
    });

    sleep(1);
}

//k6 run --insecure-skip-tls-verify group-getUserGroup.js