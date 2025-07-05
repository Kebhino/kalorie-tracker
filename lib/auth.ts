import { authOptions } from "@/app/api/auth/authOptions";
import { getServerSession } from "next-auth";

export const getAuthSession = () => getServerSession(authOptions);
