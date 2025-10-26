const MULTIPARAMETER_API_BASE_URL = import.meta.env.VITE_MULTIPARAMETER_API_URL || 'http://localhost:8001';

export interface VitalsInput {
  'DeltaQTc [msec]': number;
  'HR [bpm]': number;
  'NBPd [mmHg]': number;
  'NBPm [mmHg]': number;
  'NBPs [mmHg]': number;
  'PVC [/min]': number;
  'Perf [NU]': number;
  'Pulse (NBP) [bpm]': number;
  'Pulse (SpO2) [bpm]': number;
  'QT [msec]': number;
  'QT-HR [bpm]': number;
  'QTc [msec]': number;
  'RR [rpm]': number;
  'ST-III [mm]': number;
  'ST-V [mm]': number;
  'SpO2 [%]': number;
  'btbHR [bpm]': number;
}

export interface PredictionResponse {
  patient_id: string;
  timestamp: string;
  risk_probability: number;
  predicted_class: number;
  status_message: string;
}

export interface PatientHistory {
  patient_id: string;
  data: Array<{
    timestamp: string;
    vitals: VitalsInput;
    prediction?: PredictionResponse;
  }>;
}

class MultiparameterApiService {
  private baseURL: string;

  constructor(baseURL: string = MULTIPARAMETER_API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Multiparameter API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/');
  }

  // Predict risk for a patient
  async predictRisk(patientId: string, vitals: VitalsInput): Promise<PredictionResponse> {
    return this.request<PredictionResponse>(`/predict/${patientId}`, {
      method: 'POST',
      body: JSON.stringify(vitals),
    });
  }

  // Upload and process CSV file
  async uploadCsvFile(file: File, patientId: string): Promise<{
    success: boolean;
    message: string;
    predictions: PredictionResponse[];
    summary: {
      total_rows: number;
      predictions_made: number;
      average_risk: number;
      high_risk_count: number;
    };
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', patientId);

    const response = await fetch(`${this.baseURL}/upload-csv`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to upload CSV file');
    }

    return response.json();
  }

  // Process CSV data row by row (simulation)
  async processCsvData(csvData: string, patientId: string): Promise<{
    predictions: PredictionResponse[];
    summary: {
      total_rows: number;
      predictions_made: number;
      average_risk: number;
      high_risk_count: number;
    };
  }> {
    // Parse CSV data
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const dataRows = lines.slice(1).filter(line => line.trim());

    const predictions: PredictionResponse[] = [];
    let predictionsMade = 0;
    let totalRisk = 0;
    let highRiskCount = 0;

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const values = dataRows[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) continue;

      // Create vitals object
      const vitals: Partial<VitalsInput> = {};
      headers.forEach((header, index) => {
        if (header !== 'Patient_ID' && header !== 'time' && header !== 'Target') {
          const value = parseFloat(values[index]);
          if (!isNaN(value)) {
            vitals[header as keyof VitalsInput] = value;
          }
        }
      });

      // Check if we have all required vitals
      const requiredFields: (keyof VitalsInput)[] = [
        'DeltaQTc [msec]', 'HR [bpm]', 'NBPd [mmHg]', 'NBPm [mmHg]', 'NBPs [mmHg]',
        'PVC [/min]', 'Perf [NU]', 'Pulse (NBP) [bpm]', 'Pulse (SpO2) [bpm]',
        'QT [msec]', 'QT-HR [bpm]', 'QTc [msec]', 'RR [rpm]', 'ST-III [mm]',
        'ST-V [mm]', 'SpO2 [%]', 'btbHR [bpm]'
      ];

      const hasAllFields = requiredFields.every(field => vitals[field] !== undefined);
      
      if (hasAllFields) {
        try {
          const prediction = await this.predictRisk(patientId, vitals as VitalsInput);
          predictions.push(prediction);
          predictionsMade++;
          totalRisk += prediction.risk_probability;
          
          if (prediction.predicted_class === 1) {
            highRiskCount++;
          }
        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
        }
      }
    }

    const averageRisk = predictionsMade > 0 ? totalRisk / predictionsMade : 0;

    return {
      predictions,
      summary: {
        total_rows: dataRows.length,
        predictions_made: predictionsMade,
        average_risk: averageRisk,
        high_risk_count: highRiskCount,
      },
    };
  }

  // Get patient history (if backend supports it)
  async getPatientHistory(patientId: string): Promise<PatientHistory> {
    return this.request<PatientHistory>(`/patient/${patientId}/history`);
  }
}

export const multiparameterApiService = new MultiparameterApiService();
export default multiparameterApiService;
