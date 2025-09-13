import React, {useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {
    Button, Card, Col, DatePicker, Drawer, Form, Input, notification, Row, Space,
    Spin, Statistic
} from "antd";
import {useNavigate, useParams} from "react-router-dom";
import {useGetAllQuery, usePostQuery} from "../../../hooks/api";
import {URLS} from "../../../constants/url";
import {KEYS} from "../../../constants/key";
import {DownloadOutlined} from "@ant-design/icons";
import {get, head, isEqual, last} from "lodash"
import dayjs from "dayjs";
import config from "../../../config";
import useAuth from "../../../hooks/auth/useAuth";
import {request} from "../../../services/api";
import numeral from "numeral";


const ViewPage = () => {
    const {id} = useParams();
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {user} = useAuth()
    const [open, setOpen] = useState(false);
    const {mutate, isPending} = usePostQuery({})
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    let {data, isLoading, refetch} = useGetAllQuery({
        key: [KEYS.show, id],
        url: `${URLS.show}/${id}`,
        enabled: !!(id)
    });

    const annualInsuranceRequest = (_params) => {
        mutate({
            url: URLS.cancelInsurance,
            attributes: {..._params}
        }, {
            onSuccess: () => {
                form.resetFields()
                refetch()
                setOpen(false)
            }
        })
    }

    if (isLoading) {
        return <Spin spinning fullscreen/>
    }

    return (
        <>
            <PageHeader
                title={t('Карточка полиса')}
                onBack={() => navigate(-1)}
                extra={[
                    <Button
                        loading={loading}
                        onClick={() => {
                            setLoading(true)
                            request.get(`${URLS.polisReport}/${id}`, {
                                params: {},
                                responseType: 'blob',
                            }).then(res => {
                                const blob = new Blob([res.data], {type: res.data.type});
                                const blobUrl = URL.createObjectURL(blob);
                                window.open(blobUrl, '_self')
                                notification['success']({
                                    message: 'Успешно'
                                })
                            }).catch((err) => {
                                notification['error']({
                                    message: err?.response?.data?.message || 'Ошибка'
                                })
                            }).finally(() => {
                                setLoading(false)
                            })
                        }}
                        icon={<DownloadOutlined/>} type={'dashed'}>
                        {t('Скачать в Excel')}
                    </Button>,
                    isEqual(get(data, 'data.status'), 'sent') && isEqual(get(user, 'role'), config.ROLES.operator) &&
                    <Button onClick={() => {
                        form.setFieldValue('ticket_number', get(data, 'data.ticketData.ticket_number'))
                        form.setFieldValue('policy_number', get(data, 'data.policyDetails.number', '-'))
                        setOpen(true)
                    }} danger type={'primary'}>
                        {t('Аннулировать')}
                    </Button>
                ]}
            >
                <Card bordered title={t('Общая информация')}>
                    <Row gutter={16}>
                        <Col span={12} className={'mb-4'}>
                            <Statistic formatter={(value) => value} title={t("Номер транзакции")}
                                       value={get(data, 'data.external_transaction_id', '-')}/>
                        </Col>
                        <Col span={12} className={'mb-4'}>
                            <Statistic formatter={(value) => value} title={t("Номер страхового полиса")}
                                       value={`${get(data, 'data.policyDetails.seria', '-')}${get(data, 'data.policyDetails.number', '-')}`}/>
                        </Col>
                        <Col span={12} className={'mb-4'}>
                            <Statistic title={t("Страховая сумма")} value={`${numeral(get(data, 'data.policyDetails.insuranceSum', 0)).format()} ${get(data, 'data.policyData.purchaseCurrency', '')}`}/>
                        </Col>
                        <Col span={12} className={'mb-4'}>
                            <Statistic title={t("Страховая премия")}
                                       value={`${numeral(get(data, 'data.policyDetails.insurancePremium', 0)).format()} ${get(data, 'data.policyData.purchaseCurrency', '')}`}/>
                        </Col>
                        <Col span={12} className={'mb-4'}>
                            <Statistic formatter={(value) => value} title={t("Номер билета")}
                                       value={get(data, 'data.ticketData.ticketNumber', '-')}/>
                        </Col>
                        <Col span={12} className={'mb-4'}>
                            <Statistic formatter={(value) => value} title={t("Фамилия пассажира")}
                                       value={get(data, 'data.insurant.lastName', '-')}/>
                        </Col>
                        <Col span={12} className={'mb-4'}>
                            <Statistic formatter={(value) => value} title={t("Имя пассажира")}
                                       value={get(data, 'data.insurant.firstName', '-')}/>
                        </Col>
                        <Col span={12} className={'mb-4'}>
                            <Statistic formatter={(value) => value} title={t("Гражданство")}
                                       value={get(data, 'data.insurant.nationality', '-')}/>
                        </Col>
                        <Col span={12} className={'mb-4'}>
                            <Statistic formatter={(value) => value} title={t("Количество мест застрахованного багажа")}
                                       value={get(data, 'data.ticketData.baggageCount', '-')}/>
                        </Col>
                        <Col span={12} className={'mb-4'}>
                            <Statistic formatter={(value) => value} title={t("Номер рейса")}
                                       value={get(data, 'data.ticketData.flights', [])?.join('/')}/>
                        </Col>
                        <Col span={12} className={'mb-4'}>
                            <Statistic formatter={(value) => value} title={t("Дата начала действия полиса")}
                                       value={get(data, 'data.sentDate') ? dayjs(get(data, 'data.sentDate')).format("DD.MM.YYYY HH:mm") : '-'}/>
                        </Col>
                        <Col span={12} className={'mb-4'}>
                            <Statistic valueStyle={{color: isEqual(get(data, 'data.status'), 'sent') ? 'green' : 'red'}}
                                       formatter={(value) => value} title={t("Статус полиса")}
                                       value={t(get(data, 'data.status'))}/>
                        </Col>
                    </Row>
                </Card>
            </PageHeader>
            <Drawer open={open} onClose={() => setOpen(false)} title={t('Аннулировать')}>
                <Spin spinning={isPending}>
                    <Form onFinish={annualInsuranceRequest} form={form} layout={'vertical'}>
                        <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                   name={'ticket_number'}
                                   label={t('Номер билета')}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                   name={'policy_number'} label={t('Номер страхового полиса')}>
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                   initialValue={dayjs()}
                                   name={'requested_at'} label={t('Дата запроса')}>
                            <DatePicker format={'DD.MM.YYYY'} className={'w-full'} disabled/>
                        </Form.Item>
                        <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                   name={'cancellation_reason'} label={t('Причина отмены')}>
                            <Input.TextArea/>
                        </Form.Item>
                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit">
                                    {t('Подтвердить аннулирование')}
                                </Button>
                                <Button danger type={'primary'} onClick={() => {
                                    setOpen(null)
                                    form.resetFields()
                                }}>
                                    {t('Отмена')}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Spin>
            </Drawer>
        </>

    );
};

export default ViewPage;
