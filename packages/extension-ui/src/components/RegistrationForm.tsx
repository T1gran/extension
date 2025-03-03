// Copyright 2019-2025 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";

import { styled } from "../styled";
import Button from "./Button.js";
import ButtonArea from "./ButtonArea.js";

interface RegistrationFormProps {
    address: string;
    onRegister: (data: { name: string; email?: string }) => void;
    onCancel: () => void;
  }
  
function RegistrationForm ({ address, onRegister, onCancel }: RegistrationFormProps)  {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({ name, email });
    };

    return (
    <div>
        <h3>Register Address</h3>
        <p>Address: {address}</p>
        <form onSubmit={handleSubmit}>
        <div>
            <label>Name:</label>
            <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            />
        </div>
        <div>
            <label>Email (optional):</label>
            <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
        </div>
        <ButtonArea>
            <Button type="submit">Register</Button>
            <Button onClick={onCancel}>Cancel</Button>
        </ButtonArea>
        </form>
    </div>
    );
};

export default styled(RegistrationForm)<RegistrationFormProps>`
  display: flex;
  flex-direction: column;
  background: var(--highlightedAreaBackground);
  border-top: 1px solid var(--inputBorderColor);
  padding: 16px;
  margin: 16px 0;
  border-radius: 8px;

  h3 {
    margin-bottom: 12px;
    font-size: 18px;
    color: var(--textColor);
  }

  p {
    margin-bottom: 12px;
    color: var(--textColor);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  label {
    font-weight: bold;
    color: var(--textColor);
  }

  input {
    padding: 8px;
    border: 1px solid var(--inputBorderColor);
    border-radius: 4px;
    background: var(--inputBackground);
    color: var(--textColor);
  }

  ${ButtonArea} {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }
`;