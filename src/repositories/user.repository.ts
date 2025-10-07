import crudRepository from "./crud.repository";
import User from "../models/user.model";

const userRepository = {
  ...crudRepository(User),
  async getByEmail(email: string) {
    const user = await User.findOne({ email });
    return user;
  },
  async getByUsername(username: string) {
    const user = await User.findOne({ username }).select("-password");
    return user;
  },
};

export default userRepository;
