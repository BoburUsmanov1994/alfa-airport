import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import MainLayout from '../layouts/main'
import AuthLayout from '../layouts/auth'
import {AuthProvider} from "../services/auth/auth";
import LoginPage from "../modules/auth/pages/LoginPage";
import PrivateRoute from "../services/auth/PrivateRoute";
import ListPage from "../modules/agreement/pages/ListPage";
import ViewPage from "../modules/agreement/pages/ViewPage";
import {useSettingsStore} from "../store";
import ProfilePage from "../modules/agreement/pages/ProfilePage";

const Index = () => {
    const {token} = useSettingsStore()
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={token ? <Navigate to={'/insurance'} replace/> : <AuthLayout>
                        <LoginPage/>
                    </AuthLayout>}/>

                    <Route
                        path={"/insurance"}
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ListPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/insurance/view/:id"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ViewPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path={"/profile"}
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ProfilePage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    <Route path={"/"} element={<Navigate to={'/insurance'} replace/>}/>
                    <Route path={"*"} element={<Navigate to={'/'} replace/>}/>
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default Index;
