import { authOptions } from "@/pages/api/auth/authOptions";
import { getServerSession } from "next-auth";

export const getAuthSession = () => getServerSession(authOptions);
