import axios from 'axios'

export const signup = async (data: any) => {
  try {
    const response = await axios.post('/api/auth/signup', data)
    return response.data
  } catch (error) {
    throw new Error('Signup failed')
  }
}

