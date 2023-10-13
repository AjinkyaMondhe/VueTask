import { createStore } from 'vuex';
import axios from 'axios';


const state = {
  token: localStorage.getItem('token') || null, // Store the user's token in the state
};

const mutations = {
  setToken(state, token) {
    state.token = token;
    localStorage.setItem('token', token); // Save the token to local storage
  },
  clearToken(state) {
    state.token = null;
    localStorage.removeItem('token'); // Remove the token from local storage
  },
};

const actions = {
  async login({ commit }, { email, password }) {
    const response = await axios.post("http://localhost:3000/login", {
      email,
      password,
    });
  
    if (response.status === 200) {
      const { data } = response;
      commit('setToken', data.token);
      return data.token;
    } else if (response.status === 401) {
      throw new Error("Invalid email or password");
    } else {
      throw new Error("Unexpected response from the server");
    }
  },
  
    
    logout({ commit }) {
      commit('clearToken');
    },
  };
  
  

const getters = {
  isAuthenticated: (state) => !!state.token,
};

export default createStore({
  state,
  mutations,
  actions,
  getters,
});
