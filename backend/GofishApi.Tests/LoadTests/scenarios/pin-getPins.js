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
    const res = http.post(`${BASE_URL}/api/Pin/GetPins`, JSON.stringify({
        ids: [
            { id: 1 },
            { id: 2 }
        ],
        dataRequest: {
            includeGeolocation: false,
            includeAuthor: true,
            includeDetails: true,
            includeStats: true,
            includeUgc: false,
            includeGroups: false
        },
        maxResults: 20,
        lastTimestamp: null
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`,
        },
    });

    check(res, {
        'getPins 200': (r) => r.status === 200,
        'tem body': (r) => r.body && r.body.length > 0,
    });

    sleep(1);
}