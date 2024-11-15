import React, { useState } from "react";

import { Form, FormControl, Label, HelpText, Input } from "@twilio-paste/core";

export function UserContext(props) {
  const [profile, setProfile] = useState({
    Item: {
      useCase: "",
      firstName: "",
      lastName: "",
      pk: "", // phone number is partition key
      pk1: "",
      sk: "",
      sk1: "",
    },
  });

  // let user = {};
  // user.Item = {
  //   useCase: "apartmentSearchUseCase",
  //   lastName: "Johnstone",
  //   pk1: "profile",
  //   sk: "profile",
  //   sk1: "+16477782422",
  //   pk: "+16477782422",
  //   firstName: "Ben",
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      Item: {
        ...prevProfile.Item,
        [name]: value,
      },
    }));
  };

  return (
    <div>
      <Form maxWidth="size70">
        <FormControl>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            name="firstName"
            value={profile.Item.firstName}
            onChange={handleInputChange}
            placeholder="Enter first name"
          />
        </FormControl>
        <FormControl>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            name="lastName"
            value={profile.Item.lastName}
            onChange={handleInputChange}
            placeholder="Enter last name"
          />
        </FormControl>
        <FormControl>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            name="pk"
            value={profile.Item.pk}
            onChange={handleInputChange}
            placeholder="Enter phone number"
          />
        </FormControl>
      </Form>
    </div>
  );
}
export default UserContext;
