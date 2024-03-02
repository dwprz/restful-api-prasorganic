import prismaClient from "../../src/applications/database.ts";
import bcrypt from "bcrypt";

const remove = async () => {
  await prismaClient.user.deleteMany({
    where: { username: "userTest" },
  });
};

const create = async () => {
  await prismaClient.user.create({
    data: {
      username: "userTest",
      full_name: "nameTest",
      profile: "uploads/default-profile.svg",
      phone_number: "+16505553434",
      password: await bcrypt.hash("rahasia", 10),
    },
  });
};

export const utilUserTest = {
  remove,
  create,
};
