import React, { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import _ from "lodash";
import { Button, TextInput, Toasts } from "@common/web-components";
import PageSection from "../../components/PageSection";
import useIsLoggedIn from "@/auth/useIsLoggedIn";
import { AuthManager } from "@/auth/auth";

function LoginPage() {
  const { isLoggedIn } = useIsLoggedIn();
  const navigate = useNavigate()

  const toasts = Toasts.useToasts()

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("")

  if (isLoggedIn) {
    console.log("Navigating to root because already logged in")
    return <Navigate to="/" />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      await AuthManager.login({ username, password })


      console.log("Navigating to root because logged in")
      navigate("/")

    } catch (e: unknown) {
      toasts.createToast({
        label: _.compact(['Failed to login', (e as Error)?.message]).join(': '),
        theme: 'danger'
      })
    }
  }

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-white">
      <PageSection className="p-16 flex justify-center flex-col" padding="none">
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <TextInput label="Username" type="text" autocomplete="username" value={username} onChange={setUsername}></TextInput>
          <TextInput label="Password" type="password" autocomplete="current-password" value={password} onChange={setPassword}></TextInput>

          <Button theme="primary" size="lg" type='submit' className="mt-4">
            Login
          </Button>
        </form>
      </PageSection>
    </div>
  );
}

export default LoginPage;
