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
const GROUP_ID = __ENV.GROUP_ID || '1';

export function setup() {
    const token = signIn();
    return { token };
}

export default function (data) {
    const res = http.get(`${BASE_URL}/api/Group/GetGroup/${GROUP_ID}`, {
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
        'getGroup status 200': (r) => r.status === 200,
        'response has body': (r) => r.body && r.body.length > 0,
        'body has id': () => body !== null && body.id !== undefined,
        'body has name': () => body !== null && body.name !== undefined,
        'body has memberCount': () => body !== null && body.memberCount !== undefined,
        'body has pinCount': () => body !== null && body.pinCount !== undefined,
    });

    sleep(1);
}

//k6 run -e BASE_URL=https://localhost:7113 -e GROUP_ID=1 group/get-group.js