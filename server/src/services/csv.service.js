const escapeCsvValue = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const generateApplicationsCsv = (applications = []) => {
  const headers = [
    'ID',
    'Company',
    'Job Title',
    'Status',
    'Priority',
    'Work Arrangement',
    'Employment Type',
    'Experience Level',
    'Salary Min',
    'Salary Max',
    'Currency',
    'Source',
    'Location',
    'Job URL',
    'Company Website',
    'Recruiter Name',
    'Recruiter Email',
    'Recruiter Phone',
    'Application Date',
    'Tags',
    'Notes',
    'Created At',
  ];

  const rows = applications.map((app) => [
    app._id.toString(),
    app.company,
    app.jobTitle,
    app.status,
    app.priority,
    app.workArrangement,
    app.employmentType,
    app.experienceLevel,
    app.salaryMin !== null ? app.salaryMin : '',
    app.salaryMax !== null ? app.salaryMax : '',
    app.currency,
    app.source,
    app.location,
    app.jobUrl,
    app.companyWebsite,
    app.recruiterName,
    app.recruiterEmail,
    app.recruiterPhone,
    app.applicationDate ? new Date(app.applicationDate).toISOString().split('T')[0] : '',
    (app.tags || []).join('; '),
    app.notes,
    app.createdAt ? new Date(app.createdAt).toISOString() : '',
  ]);

  const csvContent = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => row.map(escapeCsvValue).join(',')),
  ].join('\r\n');

  return csvContent;
};
