import json
import urllib.request

BASE = 'http://127.0.0.1:8000'

def post_token(username, password):
    url = f"{BASE}/api/auth/token/"
    data = json.dumps({'username': username, 'password': password}).encode()
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)

def get_profile(access_token):
    url = f"{BASE}/api/users/profile/"
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {access_token}'})
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)

if __name__ == '__main__':
    try:
        tokens = post_token('admin', 'admin123')
        print('Tokens:')
        print(json.dumps(tokens, indent=2))
        profile = get_profile(tokens['access'])
        print('\nProfile:')
        print(json.dumps(profile, indent=2))
    except Exception as e:
        print('Error:', e)
