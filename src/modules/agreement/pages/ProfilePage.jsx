import React from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {
    Button,
    Card, Col, Form, Input, Row, Statistic
} from "antd";
import {useNavigate} from "react-router-dom";
import {usePostQuery} from "../../../hooks/api";
import useAuth from "../../../hooks/auth/useAuth";
import {get} from "lodash";
import {URLS} from "../../../constants/url";


const ProfilePage = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {user} = useAuth()
    const {mutate, isPending} = usePostQuery({})
    const changePassword = (_attrs) => {
        mutate({url: URLS.changePassword, attributes: {..._attrs}}, {
            onSuccess: ({data}) => {
                localStorage.clear()
                window.location.reload()
            }
        });
    }
    return (
        <>
            <PageHeader>
                <Card bordered title={t('Profile')}>
                    <Row gutter={16}>
                        <Col span={16}>
                            <Statistic className={'mb-4'} formatter={(value) => value} title={t("Username")}
                                       value={get(user, 'username', '-')}/>
                            <Statistic formatter={(value) => value} title={t("Role")}
                                       value={t(get(user, 'role', '-'))}/>
                        </Col>
                        <Col span={8}>
                            <h2 className={' text-xl mb-4 font-semibold'}>{t("Change password")}</h2>
                            <Form layout={'vertical'}
                                  onFinish={changePassword}
                            >
                                <Form.Item
                                    label={t("Old password")}
                                    name="oldPassword"
                                    rules={[{required: true, message: t('Требуется пароль')}]}
                                >
                                    <Input.Password/>
                                </Form.Item>
                                <Form.Item
                                    label={t("New password")}
                                    name="newPassword"
                                    rules={[{required: true, message: t('Требуется пароль')}]}
                                >
                                    <Input.Password/>
                                </Form.Item>
                                <Form.Item label={null}>
                                    <Button loading={isPending} block type="primary" htmlType="submit"
                                            className={'font-medium'}>
                                        {t('Save')}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>
                </Card>
            </PageHeader>
        </>

    );
};

export default ProfilePage;
