import axios from "axios";
import { BaseUrl } from "./api";

export const buildingsService = {
  getBuildings: async () => {
    const res = await axios.get(`${BaseUrl}/admin/buildings`);
    console.log("building response: ", res.data);
    return res.data;
  },
};
