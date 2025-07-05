import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/route";

export const getAuthSession = () => getServerSession(authOptions);
