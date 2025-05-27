import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const EnrollmentChart = ({ enrollmentHistory }) => {
  if (!enrollmentHistory || enrollmentHistory.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No enrollment data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Enrollment History</h3>
      <Line
        data={{
          labels: enrollmentHistory.map(item => item.day),
          datasets: [
            {
              label: 'New Enrollments',
              data: enrollmentHistory.map(item => item.new),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'transparent',
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
              tension: 0.4,
              yAxisID: 'y'
            },
            {
              label: 'Total Enrollments',
              data: enrollmentHistory.map(item => item.total),
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'transparent',
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
              tension: 0.4,
              yAxisID: 'y1'
            }
          ]
        }}
        options={{
          responsive: true,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y + ' students';
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45
              },
              grid: {
                display: false
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'New Enrollments'
              },
              beginAtZero: true,
              ticks: {
                stepSize: 1
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Total Enrollments'
              },
              beginAtZero: true,
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }}
      />
    </div>
  );
};

export default EnrollmentChart; 