"""
    title: 'Room Reservation',
    chooseLanguage: 'Language',
    englishVersion: 'English',
    chineseVersion: '中文版',

    reservations: 'Reservations',
    makeReservation: 'Book',
    notices: 'Notices',
    about: 'About',
    
    info: 'Info',
    login: 'Login',
    logout: 'Logout',
"""

import re, json

data={}
for line in __doc__.split('\n'):
    if line:
        res = re.search(r'\s*(\w+):\s*\'(.*)\',', line)
        if res:
            data[res.group(1)] = res.group(2)

print(json.dumps(data, indent=4, ensure_ascii=False))