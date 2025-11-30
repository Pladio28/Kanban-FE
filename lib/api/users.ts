import { useApi } from "../axios";

export const useUsersApi = () => {
  const api = useApi();

  const getUsers = async () => {
    const res = await api.get("/clerk-users");
    return res.data?.users ?? [];
  };

  return { getUsers };
};
