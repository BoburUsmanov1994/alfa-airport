import React, {useRef, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {Button, DatePicker, Drawer, Dropdown, Form, Input, notification, Space, Spin, Tag} from "antd";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {useNavigate} from "react-router-dom";
import {get, head, isEqual, join, last, reverse, split} from "lodash"
import numeral from "numeral";
import dayjs from "dayjs";
import {DownloadOutlined, EyeOutlined, StopOutlined} from "@ant-design/icons";
import {isNil} from "lodash/lang";
import {usePostQuery} from "../../../hooks/api";
import useAuth from "../../../hooks/auth/useAuth";
import config from "../../../config";
import {request} from "../../../services/api";

const color = {
    sent: 'green',
    cancelled: 'red'
}

const ListPage = () => {
    const {t} = useTranslation()
    const navigate = useNavigate();
    const formRef = useRef(null);
    const actionRef = useRef(null);
    const {user} = useAuth()
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const {mutate, isPending} = usePostQuery({})
    const handleClick = ({key}, _record) => {
        if (isEqual(key, 'view')) {
            navigate(`/insurance/view/${get(_record, '_id')}`);
        } else {
            setRecord(_record);
            form.setFieldValue('ticket_number', get(_record, 'ticketData.ticket_number'))
            form.setFieldValue('policy_number', `${get(_record, 'policyDetails.number', '-')}`)
        }
    }

    const annualInsuranceRequest = (_params) => {
        mutate({
            url: URLS.cancelInsurance,
            attributes: {..._params}
        }, {
            onSuccess: () => {
                actionRef.current?.reload()
                form.resetFields()
                setRecord(null)
            }
        })
    }

    return (
        <>
            <PageHeader
                className={'p-0 mb-1.5'}
                title={t('Реестр полисов')}
            >
                <Datagrid
                    span={6}
                    responseListKeyName={'items'}
                    formRef={formRef}
                    actionRef={actionRef}
                    defaultCollapsed={false}
                    rowClassName={(record) => {
                        return record?.status === 'cancelled' ? 'bg-red-100' : '';
                    }}
                    columns={[
                        {
                            title: t('Номер транзакции'),
                            dataIndex: 'external_transaction_id',
                            render: (_, record) => get(record, 'external_transaction_id'),
                            width: 200,
                        },
                        {
                            title: t('Номер страхового полиса'),
                            dataIndex: 'policy_number',
                            width: 175,
                            render: (_, record) => `${get(record, 'policyDetails.seria', '-')}${get(record, 'policyDetails.number', '-')}`
                        },
                        {
                            title: t('Страховая сумма'),
                            dataIndex: 'policyDetails',
                            render: (value, _record) => !isEqual(get(_record, 'policyData.currency'), 'UZS') ? numeral(get(_record, 'insuranceForeignSum')).format('0,0.00') + ` ${get(_record, 'policyData.currency', '')}` : numeral(get(value, 'insuranceSum')).format('0,0.00') + ` ${get(_record, 'policyData.currency', '')}`,
                            align: 'center',
                            width: 150,
                            hideInSearch: true,
                        },
                        {
                            title: t('Страховая премия'),
                            dataIndex: 'policyDetails',
                            render: (value, _record) => !isEqual(get(_record, 'policyData.currency'), 'UZS') ? numeral(get(_record, 'insuranceForeignPremium')).format('0,0.00') + ` ${get(_record, 'policyData.currency', '')}` : numeral(get(value, 'insurancePremium')).format('0,0.00') + ` ${get(_record, 'policyData.currency', '')}`,
                            align: 'center',
                            width: 150,
                            hideInSearch: true,
                        },
                        {
                            title: t('Номер билета'),
                            dataIndex: 'ticketData',
                            hideInSearch: true,
                            width: 150,
                            align: 'center',
                            render: (value) => get(value, 'ticket_number'),
                        },
                        {
                            title: t('Фамилия пассажира'),
                            dataIndex: 'insurant',
                            hideInSearch: true,
                            width: 150,
                            align: 'center',
                            render: (value) => get(value, 'surname_passenger'),
                        },
                        {
                            title: t('Имя пассажира'),
                            dataIndex: 'insurant',
                            hideInSearch: true,
                            width: 150,
                            align: 'center',
                            render: (value) => get(value, 'name_passenger'),
                        },
                        {
                            title: t('Паспорт пассажира'),
                            dataIndex: 'insurant',
                            hideInSearch: true,
                            width: 150,
                            align: 'center',
                            render: (value) => get(value, 'document_number'),
                        },
                        {
                            title: t('Количество мест застрахованного багажа'),
                            dataIndex: 'ticketData',
                            hideInSearch: true,
                            width: 125,
                            align: 'center',
                            render: (value) => get(value, 'baggage_count'),
                        },
                        {
                            title: t('Номер рейса'),
                            dataIndex: 'ticketData',
                            hideInSearch: true,
                            align: 'center',
                            width: 150,
                            render: (value) => get(value, 'flights').join('/'),
                        },
                        {
                            title: t('Дата начала действия полиса'),
                            dataIndex: 'policyData',
                            hideInSearch: true,
                            width: 150,
                            align: 'center',
                            render: (value) => dayjs(get(value, 'startDate')).format('DD.MM.YYYY HH:mm'),
                        },
                        {
                            title: t('Дата и время оформления полиса'),
                            dataIndex: 'sentDate',
                            hideInSearch: true,
                            width: 150,
                            align: 'center',
                            render: (value) => dayjs(value).format('DD.MM.YYYY HH:mm'),
                        },
                        {
                            title: t('Статус полиса'),
                            dataIndex: 'status',
                            hideInSearch: true,
                            width: 225,
                            align: 'center',
                            render: (value) => <Tag color={color[value] || 'default'}>{t(value)}</Tag>,
                        },
                        {
                            title: t('Статус'),
                            dataIndex: 'status',
                            valueType: 'select',
                            initialValue: 'sent',
                            hideInTable: true,
                            fieldProps: {
                                options: [
                                    {
                                        label: t('Действующий (полис действует)'),
                                        value: 'sent',
                                    },
                                    {
                                        label: t('Аннулирован (полис отменен и не действует)'),
                                        value: 'cancelled',
                                    }
                                ]
                            },
                        },
                        {
                            title: t('Дата начала действия полиса'),
                            dataIndex: 'sentDate',
                            valueType: 'dateRange',
                            fieldProps: {
                                format: 'DD.MM.YYYY',
                            },
                            initialValue: [dayjs().add(-1, 'd'), dayjs()],
                            search: {
                                transform: (value) => {
                                    return ({
                                        fromDate: join(reverse(split(value[0], '.')), '-'),
                                        toDate: join(reverse(split(value[1], '.')), '-'),
                                    })
                                },
                            },
                            hideInTable: true,
                        },
                        {
                            title: t('Дата и время оформления полиса'),
                            dataIndex: 'startDate',
                            valueType: 'dateRange',
                            fieldProps: {
                                format: 'DD.MM.YYYY',
                            },
                            search: {
                                transform: (value) => {
                                    return ({
                                        startFromDate: join(reverse(split(value[0], '.')), '-'),
                                        startToDate: join(reverse(split(value[1], '.')), '-'),
                                    })
                                },
                            },
                            hideInTable: true,
                        },
                        {
                            title: t('Actions'),
                            dataIndex: 'id',
                            width: 160,
                            hideInSearch: true,
                            align: 'center',
                            fixed: 'right',
                            render: (_, __record) => <Dropdown.Button
                                menu={{
                                    items: isEqual(get(user, 'role'), config.ROLES.operator) && !isEqual(get(__record, 'status'), 'cancelled') ? [
                                            {
                                                label: t('Просмотр'),
                                                key: 'view',
                                                icon: <EyeOutlined/>,
                                            },
                                            {
                                                label: t('Аннулировать'),
                                                key: 'cancel',
                                                icon: <StopOutlined/>,
                                                danger: true
                                            }
                                        ] :
                                        [
                                            {
                                                label: t('Просмотр'),
                                                key: 'view',
                                                icon: <EyeOutlined/>,
                                            }
                                        ],
                                    onClick: (e) => handleClick(e, __record)
                                }}
                            >
                                {t('Actions')}
                            </Dropdown.Button>,
                        },

                    ]}
                    url={URLS.insurances}>
                    {({actionRef}) => <Button loading={loading} type={'dashed'} icon={<DownloadOutlined/>}
                                              onClick={() => {
                                                  const {
                                                      status,
                                                      sentDate,
                                                      startDate,
                                                      external_transaction_id,
                                                      policy_number,
                                                      ...rest
                                                  } = formRef?.current?.getFieldsValue?.()
                                                  const {current, pageSize} = actionRef?.current?.pageInfo
                                                  setLoading(true)
                                                  request.get(URLS.generalReport, {
                                                      params: {
                                                          fromDate: sentDate ? dayjs(head(sentDate)).format('YYYY-MM-DD'):undefined,
                                                          toDate: sentDate? dayjs(last(sentDate)).format('YYYY-MM-DD') : undefined,
                                                          startFromDate: startDate? dayjs(head(startDate)).format('YYYY-MM-DD'):undefined,
                                                          startToDate: startDate? dayjs(last(startDate)).format('YYYY-MM-DD'):undefined,
                                                          page: current - 1,
                                                          limit: pageSize,
                                                          external_transaction_id,
                                                          policy_number,
                                                          status
                                                      },
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
                                              }}>
                        {t('Отчет')}
                    </Button>}
                </Datagrid>
            </PageHeader>
            <Drawer open={!isNil(record)} onClose={() => setRecord(null)} title={t('Аннулировать')}>
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
                                    setRecord(null)
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

export default ListPage;
