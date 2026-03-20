import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req) => {
  const { userId, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { userId, password: hashPassword },
  });
});

app.post("/login", async (req, res) => {
  const { userId, password } = req.body;

  const user = await prisma.user.findUnique({ where: { userId } });

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).send("계정이 없어용");

  const token = jwt.sign({ id: user.id, userId: user.userId }, "secret");
  res.json({ token, userId });
});

app.listen(4000);
