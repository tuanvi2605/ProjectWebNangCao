"use client"

import { CardHeader, CardTitle, Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaGithub } from "react-icons/fa";
import { useState } from "react";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    return (
        <div className="h-screen flex items-center justify-center w-full bg-blue-500">
            {/* <Tabs defaultValue="account" className="w-[400px]">
                <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">Make changes to your account here.</TabsContent>
                <TabsContent value="password">Change your password here.</TabsContent>
            </Tabs> */}
            <Card className="md:h-auto w-[30%] sm:w-[420px] p-4 sm:p-8">
                <CardHeader className="flex items-center justify-center">
                    <CardTitle className="text-2xl">Đăng nhập</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-5">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="focus:ring-2 focus:ring-blue-500 focus:scale-103 transition-all"
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="focus:ring-2 focus:ring-blue-500 focus:scale-103 transition-all"
                        />
                        <div className="flex justify-center pt-3 pb-10">
                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={()=> {
                                alert("Sign in")
                            }}>Sign in</Button>
                        </div>
                    </form>
                    <div className="flex justify-center text-m text-gray-500"><a href="/signup">Chưa có tài khoản ? Đăng ký tại đây</a></div>
                </CardContent>
                <div className="flex items-center w-full my-4">
                    <div className="flex-grow border-t border-gray-400"></div>
                    <span className="px-3 text-gray-600">Hoặc</span>
                    <div className="flex-grow border-t border-gray-400"></div>
                </div>

                <CardFooter className="flex flex-col w-full space-y-2">
                    <Button size="lg" className="bg-slate-400 hover:bg-slate-500 w-full" onClick={() => alert("Sign up with Github")}>
                        <FaGithub className="mr-2" /> Sign up with Github
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SignUp;
