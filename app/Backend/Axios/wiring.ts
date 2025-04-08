import axios from 'axios'

export const SIGNUP_WIRING = async (data: any) => {
  try {
    const response = await axios.post('/api/auth/signup', data)
    return response.data
  } catch (error) {
    throw new Error('Signup failed')
  }
}




export const SIGIN_WIRING = {
  login: async (usernameOrEmail: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/sigin', 
        { usernameOrEmail, password },
        { 
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true 
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Login failed');
    }
  },
};