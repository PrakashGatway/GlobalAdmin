// pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import axios from 'axios'
import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CAlert,
  CBadge,
  CTooltip,
  // CSimpleBar
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilChartPie,
  cilCash,
  cilCalendar,
  cilCheckCircle,
  cilWarning,
  cilUserFollow,
  cilUserUnfollow,
  cilGraph,
  cilDollar,
  cilEnvelopeOpen,
  cilMediaPlay,
  cilMediaPause,
  cilArrowTop,
  cilArrowBottom,
  // cilGlobe,
  cilCreditCard,
  // cilTimer,
  cilCheck,
  cilX,
  cilReload,
  cilBarChart,
  // cilPieChart,
  cilList,
  cilMap,
  cilLocationPin
} from '@coreui/icons'

import apiService from '../../services/apiService'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('Month')
  const [exporting, setExporting] = useState(false)

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.get('/dashboard/admin')
      console.log('Dashboard Response:', response)
      if (response?.success) {
        setDashboardData(response.data)
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Export dashboard data to CSV
  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await apiService.get('/dashboard/admin')
      if (response?.success) {
        const data = response.data
        const exportData = {
          'Total Users': data.users?.total || 0,
          'Active Users': data.users?.active || 0,
          'Suspended Users': data.users?.suspended || 0,
          'Total Revenue': `$${data.revenue?.total || 0}`,
          'Revenue This Month': `$${data.revenue?.thisMonth || 0}`,
          'Total Applications': data.applications?.total || 0,
          'Pending Applications': data.applications?.pending || 0,
          'Completed Applications': data.applications?.completed || 0,
          'Open Support Tickets': data.support?.open || 0,
          'Pending Tickets': data.support?.pending || 0,
          'Conversion Rate': `${data.metrics?.conversionRate || 0}%`,
          'Support Resolution Rate': `${data.metrics?.supportResolutionRate || 0}%`,
          'User Engagement Rate': `${data.metrics?.userEngagementRate || 0}%`,
        }
        
        // Convert to CSV and download
        const csvContent = 'Metric,Value\n' + Object.entries(exportData)
          .map(([key, value]) => `"${key}","${value}"`)
          .join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <CSpinner color="primary" size="xl" />
        <div className="ms-3 fs-5">Loading dashboard data...</div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <CAlert color="danger" className="m-3" dismissible>
        <h5 className="alert-heading">Error Loading Dashboard</h5>
        <p className="mb-0">{error}</p>
        <hr />
        <div className="d-flex gap-2">
          <CButton color="danger" variant="outline" size="sm" onClick={fetchDashboardData}>
            <CIcon icon={cilReload} className="me-1" /> Retry
          </CButton>
        </div>
      </CAlert>
    )
  }

  // Safe data access helpers
  const users = dashboardData?.users || {}
  const support = dashboardData?.support || {}
  const revenue = dashboardData?.revenue || {}
  const purchases = dashboardData?.purchases || {}
  const applications = dashboardData?.applications || {}
  const recent = dashboardData?.recent || {}
  const metrics = dashboardData?.metrics || {}

  // Summary Cards Data
  const summaryCards = [
    {
      title: 'Total Users',
      value: users.total?.toLocaleString() || '0',
      trend: users.newUsers?.thisMonth || 0,
      trendLabel: 'this month',
      icon: cilPeople,
      iconColor: 'text-primary',
      badgeColor: 'success',
      progress: users.total > 0 ? Math.round((users.active / users.total) * 100) : 0,
      progressLabel: 'Active Users'
    },
    {
      title: 'Total Revenue',
      value: `$${revenue.total?.toLocaleString() || '0'}`,
      trend: revenue.thisMonth || 0,
      trendLabel: 'this month',
      icon: cilDollar,
      iconColor: 'text-success',
      badgeColor: 'info',
      prefix: '+$',
      progress: revenue.total > 0 ? Math.round((revenue.thisMonth / revenue.total) * 100) : 0,
      progressLabel: 'Monthly Contribution'
    },
    {
      title: 'Applications',
      value: applications.total?.toLocaleString() || '0',
      trend: applications.newApplications?.thisWeek || 0,
      trendLabel: 'this week',
      icon: cilChartPie,
      iconColor: 'text-warning',
      badgeColor: 'warning',
      progress: applications.total > 0 ? Math.round((applications.completed / applications.total) * 100) : 0,
      progressLabel: 'Completion Rate'
    },
    {
      title: 'Support Tickets',
      value: support.totalTickets?.toLocaleString() || '0',
      trend: support.pending || 0,
      trendLabel: 'pending',
      icon: cilEnvelopeOpen,
      iconColor: 'text-danger',
      badgeColor: 'danger',
      progress: support.totalTickets > 0 ? Math.round((support.open / support.totalTickets) * 100) : 0,
      progressLabel: 'Open Rate'
    }
  ]

  // Application Status Data
  const applicationStatuses = [
    { label: 'Pending', value: applications.pending || 0, color: 'warning', icon: cilCalendar },
    { label: 'Started', value: applications.started || 0, color: 'info', icon: cilMediaPlay },
    { label: 'Pre-Arrival', value: applications.byStatus?.PreArrival || 0, color: 'secondary', icon: cilUserFollow },
    { label: 'Completed', value: applications.completed || 0, color: 'success', icon: cilCheckCircle },
    { label: 'Refused', value: applications.refused || 0, color: 'danger', icon: cilX },
    { label: 'Withdrawn', value: applications.withdrawn || 0, color: 'dark', icon: cilUserUnfollow }
  ]

  // User Role Distribution
  const userRoles = [
    { label: 'Admin', value: users.byRole?.admin || 0, color: 'danger', icon: cilUser },
    { label: 'Manager', value: users.byRole?.manager || 0, color: 'info', icon: cilUserFollow },
    { label: 'Counsellor', value: users.byRole?.counsellor || 0, color: 'success', icon: cilUserFollow },
    { label: 'User', value: users.byRole?.user || 0, color: 'primary', icon: cilPeople }
  ]

  // Top Countries Data
  const topCountries = applications.topCountries?.slice(0, 5).map((country, index) => ({
    rank: index + 1,
    code: country._id,
    name: getCountryName(country._id),
    count: country.count,
    percentage: applications.total > 0 ? Math.round((country.count / applications.total) * 100) : 0
  })) || []

  // Helper: Country Code to Name
  function getCountryName(code) {
    const countries = {
      'IT': 'Italy', 'FR': 'France', 'UK': 'United Kingdom', 
      'MU': 'Mauritius', 'US': 'United States', 'IN': 'India',
      'CA': 'Canada', 'AU': 'Australia', 'DE': 'Germany', 'ES': 'Spain'
    }
    return countries[code] || code
  }

  // Recent Activities Combined
  const getRecentActivities = () => {
    const activities = []
    
    // Recent Users
    recent.users?.slice(0, 4).forEach(user => {
      activities.push({
        id: `user-${user._id}`,
        type: 'user',
        title: user.name || 'Unknown User',
        subtitle: user.email || 'No email',
        action: 'New Registration',
        time: new Date(user.createdAt).toLocaleString(),
        status: user.status,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random&color=fff`
      })
    })
    
    // Recent Applications
    recent.applications?.slice(0, 4).forEach(app => {
      activities.push({
        id: `app-${app._id}`,
        type: 'application',
        title: app.student?.name || 'Unknown Student',
        subtitle: app.course?.name || 'No course selected',
        action: `Applied to ${getCountryName(app.country)}`,
        time: new Date(app.createdAt).toLocaleString(),
        status: app.primaryStatus,
        avatar: null
      })
    })
    
    // Recent Purchases
    recent.purchases?.slice(0, 2).forEach(purchase => {
      activities.push({
        id: `purchase-${purchase._id}`,
        type: 'purchase',
        title: purchase.user?.name || 'Unknown',
        subtitle: `$${purchase.amount} via ${purchase.paymentMethod}`,
        action: 'Payment Completed',
        time: new Date(purchase.createdAt).toLocaleString(),
        status: purchase.status,
        avatar: null
      })
    })
    
    // Sort by time descending and limit to 8
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8)
  }

  const recentActivities = getRecentActivities()

  // Payment Method Stats
  const paymentMethods = revenue.byPaymentMethod?.map(method => ({
    name: method.method,
    amount: method.total,
    count: method.count,
    percentage: revenue.total > 0 ? Math.round((method.total / revenue.total) * 100) : 0
  })) || []

  return (
    <>
      {/* Header Section */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h4 className="mb-1 fw-bold">
                <CIcon icon={cilBarChart} className="me-2 text-primary" />
                Dashboard
              </h4>
              <small className="text-body-secondary">
                Real-time overview of your platform metrics and analytics
              </small>
            </div>
            <div className="d-flex gap-2">
              <CButton 
                color="light" 
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                disabled={loading}
              >
                <CIcon icon={cilReload} className={classNames({ 'spin': loading })} />
              </CButton>
              <CButton 
                color="primary" 
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={exporting}
              >
                <CIcon icon={cilCloudDownload} className="me-1" />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </CButton>
            </div>
          </div>
        </CCol>
      </CRow>

      {/* Summary Cards Row */}
      <CRow className="mb-4 g-4">
        {summaryCards.map((card, index) => (
          <CCol xs={12} sm={6} lg={3} key={index}>
            <CCard className="h-100 border-0 shadow-sm card-hover">
              <CCardBody className="pb-0">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-body-secondary text-uppercase fw-semibold small mb-1">
                      {card.title}
                    </h6>
                    <h3 className="fw-bold mb-0">{card.value}</h3>
                  </div>
                  <CIcon 
                    icon={card.icon} 
                    size="3xl" 
                    className={classNames(card.iconColor, 'opacity-75')} 
                  />
                </div>
                
                <div className="d-flex align-items-center mt-3 mb-2">
                  <CBadge color={card.badgeColor} className="me-2">
                    {card.prefix}{card.trend?.toLocaleString()}
                  </CBadge>
                  <span className="text-body-secondary small">{card.trendLabel}</span>
                </div>
              </CCardBody>
              <CCardFooter className="pt-0 border-0">
                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-body-secondary">{card.progressLabel}</span>
                  <span className="fw-semibold">{card.progress}%</span>
                </div>
                <CProgress 
                  thin 
                  className="mt-2" 
                  color={card.badgeColor} 
                  value={card.progress} 
                />
              </CCardFooter>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Key Metrics Row */}
      <CRow className="mb-4">
        <CCol xs={12} lg={8}>
          <CCard className="h-100 border-0 shadow-sm">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-0 fw-bold">
                  {/* <CIcon icon={cilPieChart} className="me-2 text-info" /> */}
                  Application Analytics
                </h6>
                <small className="text-body-secondary">Status distribution & trends</small>
              </div>
              <CButtonGroup size="sm">
                {['Week', 'Month', 'Year'].map((period) => (
                  <CButton
                    color="outline-secondary"
                    key={period}
                    active={selectedPeriod === period}
                    onClick={() => setSelectedPeriod(period)}
                    size="sm"
                  >
                    {period}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCardHeader>
            <CCardBody>
              {/* Application Status Breakdown */}
              <div className="mb-4">
                <h6 className="fw-semibold mb-3">Status Distribution</h6>
                {applicationStatuses.map((status, idx) => {
                  const percentage = applications.total > 0 
                    ? Math.round((status.value / applications.total) * 100) 
                    : 0
                  return (
                    <div key={idx} className="progress-group mb-3">
                      <div className="progress-group-header">
                        <CIcon icon={status.icon} className="me-2" size="sm" />
                        <span className="flex-grow-1">{status.label}</span>
                        <span className="fw-semibold">{status.value}</span>
                        <span className="text-body-secondary small ms-2">({percentage}%)</span>
                      </div>
                      <CProgress thin color={status.color} value={percentage} className="mt-1" />
                    </div>
                  )
                })}
              </div>

              {/* Metrics Grid */}
              <CRow xs={{ gutter: 3 }}>
                <CCol xs={6} md={4}>
                  <div className="text-center p-3 border rounded bg-light-subtle">
                    <div className="text-body-secondary small mb-1">Conversion Rate</div>
                    <div className="fs-4 fw-bold text-success">{metrics.conversionRate || 0}%</div>
                    <CProgress thin color="success" value={metrics.conversionRate || 0} className="mt-2" />
                  </div>
                </CCol>
                <CCol xs={6} md={4}>
                  <div className="text-center p-3 border rounded bg-light-subtle">
                    <div className="text-body-secondary small mb-1">Resolution Rate</div>
                    <div className="fs-4 fw-bold text-info">{metrics.supportResolutionRate || 0}%</div>
                    <CProgress thin color="info" value={metrics.supportResolutionRate || 0} className="mt-2" />
                  </div>
                </CCol>
                <CCol xs={6} md={4}>
                  <div className="text-center p-3 border rounded bg-light-subtle">
                    <div className="text-body-secondary small mb-1">User Engagement</div>
                    <div className="fs-4 fw-bold text-warning">{metrics.userEngagementRate || 0}%</div>
                    <CProgress thin color="warning" value={metrics.userEngagementRate || 0} className="mt-2" />
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} lg={4}>
          <CCard className="h-100 border-0 shadow-sm">
            <CCardHeader>
              <h6 className="mb-0 fw-bold">
                <CIcon icon={cilMap} className="me-2 text-success" />
                Top Countries
              </h6>
              <small className="text-body-secondary">Applications by destination</small>
            </CCardHeader>
<CCardBody>
  {/* Scrollable Container - Alternative to CSimpleBar */}
  <div 
    className="overflow-auto" 
    style={{ 
      maxHeight: '300px',
      paddingRight: '4px' // Prevent scrollbar overlap with content
    }}
  >
    {topCountries.length > 0 ? (
      <div className="vstack gap-3">
        {topCountries.map((country, idx) => (
          <div key={idx} className="d-flex align-items-center">
            <span className="fw-bold me-3" style={{ minWidth: '24px' }}>
              #{country.rank}
            </span>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between mb-1">
                <span className="fw-medium">{country.name}</span>
                <span className="text-body-secondary small">{country.count}</span>
              </div>
              <CProgress thin color="success" value={country.percentage} />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center text-body-secondary py-4">
        <CIcon icon={cilGlobe} size="3xl" className="mb-2 opacity-50" />
        <div>No country data available</div>
      </div>
    )}
  </div>
</CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* User Roles & Revenue Row */}
      <CRow className="mb-4">
        <CCol xs={12} lg={6}>
          <CCard className="h-100 border-0 shadow-sm">
            <CCardHeader>
              <h6 className="mb-0 fw-bold">
                <CIcon icon={cilPeople} className="me-2 text-primary" />
                User Distribution by Role
              </h6>
            </CCardHeader>
            <CCardBody>
              {userRoles.map((role, idx) => {
                const percentage = users.total > 0 
                  ? Math.round((role.value / users.total) * 100) 
                  : 0
                return (
                  <div key={idx} className="progress-group mb-4">
                    <div className="progress-group-header">
                      <CIcon icon={role.icon} className="me-2" size="sm" />
                      <span>{role.label}</span>
                      <span className="ms-auto fw-semibold me-2">{role.value}</span>
                      <CBadge color={role.color} shape="rounded-pill">
                        {percentage}%
                      </CBadge>
                    </div>
                    <CProgress thin color={role.color} value={percentage} className="mt-2" />
                  </div>
                )
              })}
              
              <hr className="my-4" />
              
              {/* User Status Summary */}
              <div className="d-flex justify-content-around text-center">
                <div>
                  <div className="fs-4 fw-bold text-success">{users.active}</div>
                  <small className="text-body-secondary">Active</small>
                </div>
                <div>
                  <div className="fs-4 fw-bold text-secondary">{users.byStatus?.Inactive || 0}</div>
                  <small className="text-body-secondary">Inactive</small>
                </div>
                <div>
                  <div className="fs-4 fw-bold text-danger">{users.suspended || 0}</div>
                  <small className="text-body-secondary">Suspended</small>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} lg={6}>
          <CCard className="h-100 border-0 shadow-sm">
            <CCardHeader>
              <h6 className="mb-0 fw-bold">
                <CIcon icon={cilCreditCard} className="me-2 text-warning" />
                Revenue by Payment Method
              </h6>
              <small className="text-body-secondary">
                Total: ${revenue.total?.toLocaleString() || '0'}
              </small>
            </CCardHeader>
            <CCardBody>
              {paymentMethods.length > 0 ? (
                <div className="vstack gap-3">
                  {paymentMethods.map((method, idx) => (
                    <div key={idx} className="border rounded p-3 bg-light-subtle">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <CIcon icon={cilCash} className="me-2 text-success" />
                          <span className="fw-semibold">{method.name}</span>
                        </div>
                        <CBadge color="primary" className="fs-6">
                          ${method.amount?.toLocaleString()}
                        </CBadge>
                      </div>
                      <div className="d-flex justify-content-between small text-body-secondary mb-2">
                        <span>{method.count} transactions</span>
                        <span>{method.percentage}% of total</span>
                      </div>
                      <CProgress color="primary" value={method.percentage} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-body-secondary py-5">
                  <CIcon icon={cilDollar} size="3xl" className="mb-2 opacity-50" />
                  <div>No revenue data available</div>
                </div>
              )}
              
              {/* Purchase Stats */}
              <hr className="my-4" />
              <CRow xs={{ gutter: 2 }} className="text-center">
                <CCol xs={4}>
                  <div className="p-2 border rounded">
                    <div className="fw-bold text-success">{purchases.completed || 0}</div>
                    <small className="text-body-secondary">Completed</small>
                  </div>
                </CCol>
                <CCol xs={4}>
                  <div className="p-2 border rounded">
                    <div className="fw-bold text-warning">{purchases.pending || 0}</div>
                    <small className="text-body-secondary">Pending</small>
                  </div>
                </CCol>
                <CCol xs={4}>
                  <div className="p-2 border rounded">
                    <div className="fw-bold text-danger">{purchases.refunded || 0}</div>
                    <small className="text-body-secondary">Refunded</small>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Recent Activity Table */}
      <CRow>
        <CCol xs={12}>
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-0 fw-bold">
                  <CIcon icon={cilList} className="me-2 text-secondary" />
                  Recent Activity
                </h6>
                <small className="text-body-secondary">
                  Latest registrations, applications & transactions
                </small>
              </div>
              <CBadge color="light" className="border">
                {recentActivities.length} items
              </CBadge>
            </CCardHeader>
            <CCardBody className="p-0">
              <CTable align="middle" className="mb-0 border-0" hover responsive>
                <CTableHead className="bg-light">
                  <CTableRow>
                    <CTableHeaderCell className="ps-4">User / Entity</CTableHeaderCell>
                    <CTableHeaderCell>Activity</CTableHeaderCell>
                    <CTableHeaderCell>Timestamp</CTableHeaderCell>
                    <CTableHeaderCell className="text-end pe-4">Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {recentActivities.map((item, index) => (
                    <CTableRow key={item.id} className="border-bottom">
                      <CTableDataCell className="ps-4">
                        <div className="d-flex align-items-center">
                          {item.avatar ? (
                            <CAvatar src={item.avatar} size="md" className="me-3" />
                          ) : (
                            <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                                 style={{ width: '40px', height: '40px' }}>
                              <CIcon icon={item.type === 'application' ? cilChartPie : cilDollar} />
                            </div>
                          )}
                          <div>
                            <div className="fw-semibold">{item.title}</div>
                            <div className="small text-body-secondary">{item.subtitle}</div>
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          <CIcon 
                            icon={item.type === 'user' ? cilUser : item.type === 'application' ? cilChartPie : cilCash} 
                            className="me-2 opacity-75" 
                          />
                          <span>{item.action}</span>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="small text-body-secondary">
                          {/* <CIcon icon={cilTimer} className="me-1" size="sm" /> */}
                          {item.time}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-end pe-4">
                        <CBadge 
                          color={
                            item.status === 'Active' || item.status === 'Completed' ? 'success' :
                            item.status === 'Pending' || item.status === 'PreArrival' ? 'warning' :
                            item.status === 'Refused' || item.status === 'Suspended' ? 'danger' :
                            'secondary'
                          }
                          className="px-3 py-2"
                        >
                          {item.status}
                        </CBadge>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {recentActivities.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan="4" className="text-center text-body-secondary py-5">
                        <CIcon icon={cilList} size="3xl" className="mb-2 opacity-50" />
                        <div>No recent activities to display</div>
                        <small>Activities will appear here as users interact with the platform</small>
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Footer Stats Bar */}
      <CRow className="mt-4">
        <CCol xs={12}>
          <CCard className="border-0 bg-primary-subtle">
            <CCardBody className="py-3">
              <div className="d-flex flex-wrap justify-content-center justify-content-md-between align-items-center gap-3">
                <small className="text-body-secondary">
                  <CIcon icon={cilCalendar} className="me-1" />
                  Last updated: {new Date().toLocaleString()}
                </small>
                <div className="d-flex flex-wrap gap-3 justify-content-center">
                  <span className="small">
                    <CIcon icon={cilPeople} className="me-1" />
                    <strong>{users.active}</strong> active users online
                  </span>
                  <span className="small">
                    <CIcon icon={cilChartPie} className="me-1" />
                    <strong>{applications.pending}</strong> applications pending review
                  </span>
                  <span className="small">
                    <CIcon icon={cilEnvelopeOpen} className="me-1" />
                    <strong>{support.open}</strong> tickets need attention
                  </span>
                </div>
                <CButton 
                  color="primary" 
                  size="sm" 
                  variant="outline"
                  onClick={fetchDashboardData}
                  disabled={loading}
                >
                  <CIcon icon={cilReload} className={classNames('me-1', { 'spin': loading })} />
                  Refresh Data
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard