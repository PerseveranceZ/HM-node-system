import * as request from '@/utils/request'

export function login(username, password) {
    return request.fetch({
        url: '/user/login',
        method: 'post',
        data: {
            username,
            password
        }
    })
}

export function getInfo(token) {
    return request.fetch({
        url: '/user/info',
        method: 'get'
    })
}

// export function logout() {
//     return request.fetch({
//         url: '/user/logout',
//         method: 'post'
//     })
// }
