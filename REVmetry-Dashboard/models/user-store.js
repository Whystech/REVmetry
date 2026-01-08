import { v4 } from "uuid";
import { initStore } from "../utils/store-utils.js";

const db = initStore("users");

export const userStore = {
  async getAllUsers() {
    await db.read();
    ///So it won't list the 0 index - the admin user/
    return db.data.users.splice(1, db.data.users.length - 1);
  },

  async addUser(user) {
    await db.read();
    user._id = v4();
    db.data.users.push(user);
    await db.write();
    return user;
  },

  async getUserById(id) {
    await db.read();
    return db.data.users.find((user) => user._id === id);
  },

  async getUserByEmail(email) {
    await db.read();
    return db.data.users.find((user) => user.email === email);
  },

  async deleteUserById(id) {
    await db.read();
    const index = db.data.users.findIndex((user) => user._id === id);
    db.data.users.splice(index, 1);
    await db.write();
  },

  async deleteAll() {
    await db.read();
    ///So it won't delete the first user - the admin user.
    db.data.users.splice(1, db.data.users.length - 1)
    await db.write();
  },

  async updateDetails(id, updatedUser) {
    await db.read();
    const user = await this.getUserById(id);
    user.firstName = updatedUser.firstName;
    user.lastName = updatedUser.lastName;
    user.email = updatedUser.email;
    await db.write();
  },

  async updatePassword(id, password) {
    await db.read();
    const user = await this.getUserById(id);
    user.password = password;
    await db.write();
  },

  async checkIfEmailExisting(emailToCheck) {
    await db.read();
    let checked = 0;
    ///.some instead of .forEach to stop and not read all users.
    db.data.users.some((user) => {
      if (user.email === emailToCheck) {
        checked = 1;
      }
    });
    return checked;
  }

};
