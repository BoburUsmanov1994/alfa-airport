import React from 'react';
import {Button, Form, Input, Spin} from "antd";
import {useTranslation} from "react-i18next";
import {useAuth} from "../../../services/auth/auth";
import {usePostQuery} from "../../../hooks/api";

const LoginPage = () => {
    const {t} = useTranslation();
    const {login, isLoading} = useAuth()
    const {mutate, isPending} = usePostQuery({})

    const onFinish = (data) => {
        login(data)
    }


    return (
        <>
            <Spin spinning={isLoading || isPending}>
                <h2 className={' text-xl mb-6 text-center font-semibold'}>{t("Войти в систему")}</h2>
                <Form
                    name="login"
                    layout={'vertical'}
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        className={'mb-3'}
                        label={t("Имя пользователя")}
                        name="username"
                        rules={[{required: true, message: t('Имя пользователя обязательно')}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label={t("Пароль")}
                        name="password"
                        rules={[{required: true, message: t('Требуется пароль')}]}
                    >
                        <Input.Password/>
                    </Form.Item>

                    <Form.Item label={null}>
                        <Button loading={isLoading} block type="primary" htmlType="submit" className={'font-medium'}>
                            {t('Войти')}
                        </Button>
                    </Form.Item>
                </Form>
            </Spin>
        </>
    );
};

export default LoginPage;
