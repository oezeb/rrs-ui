export const paths = {
    docs: '/api/docs.json',

    login: '/api/login',
    logout: '/api/logout',
    register: '/api/register',

    reservations: '/api/reservations',
    resv_status: '/api/reservations/status',
    resv_privacy: '/api/reservations/privacy',
    users: '/api/users',
    user_roles: '/api/users/roles',
    rooms: '/api/rooms',
    room_types: '/api/rooms/types',
    room_status: '/api/rooms/status',
    languages: '/api/languages',
    sessions: '/api/sessions',
    notices: '/api/notices',
    periods: '/api/periods',
    settings: '/api/settings',

    user: '/api/user',
    user_resv: '/api/user/reservation',

    admin: {
        settings: '/api/admin/settings',
        periods: '/api/admin/periods',
        users: '/api/admin/users',
        user_roles: '/api/admin/users/roles',
        rooms: '/api/admin/rooms',
        room_types: '/api/admin/rooms/types',
        room_status: '/api/admin/rooms/status',
        sessions: '/api/admin/sessions',
        notices: '/api/admin/notices',
        languages: '/api/admin/languages',
        reservations: '/api/admin/reservations',
        resv_status: '/api/admin/reservations/status',
        resv_privacy: '/api/admin/reservations/privacy',
    } as const,
} as const;

export const resv_privacy = {
    public: 0,
    anonymous: 1,
    private: 2,
} as const;

export const resv_status = {
    pending: 0,
    confirmed: 1,
    cancelled: 2,
    rejected: 3,
} as const;

export const room_status = {
    unavailable: 0,
    available: 1,
} as const;

export const user_role = {
    inactive: -2,
    restricted: -1,
    guest: 0,
    basic: 1,
    advanced: 2,
    admin: 3,
} as const;

export const setting = {
    timeWindow: 1,
    timeLimit: 2,
    maxDaily: 3,
} as const;
