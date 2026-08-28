export type LoginParams = {
  email: string;
  password: string;
};

export async function login({email, password}: LoginParams) {
  console.log('called');
  const res = await fetch('/api/auth/login', {
    body: JSON.stringify({email, password}),
    credentials: 'include',
    mode: 'cors',
    headers: {'Content-Type': 'application/json'},
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data.error ??
        "Something isn't working. This may be because of a technical error we're working to fix.",
    );
  }
  return data;
}
