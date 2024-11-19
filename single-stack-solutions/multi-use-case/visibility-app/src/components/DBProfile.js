import React, { useState, useEffect } from "react";
import axios from "axios";

export function Profile(props) {
  const [profile, setProfile] = useState({
    useCase: "",
    firstName: "First Name",
    lastName: "",
    pk: "",
    pk1: "",
    sk: "",
    sk1: "",
    useCase: "",
  });

  const updateProfile = async () => {};

  const getProfile = async (e) => {
    try {
      const url = process.env.REACT_APP_GET_PROFILE_URL
      const user = await axios.get(url);
      console.log(user.data.Item);
      setProfile(user.data.Item);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div>
      {profile.firstName} {profile.lastName} {profile.useCase} {profile.pk}{" "}
      {profile.sk}
    </div>
  );
}
export default Profile;
