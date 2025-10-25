import requests
import pandas as pd
import time
import json

# --- Configuration ---
API_URL = "http://127.0.0.1:8001/predict"
PATIENT_ID = "Patient_001"
CSV_FILE = "patient_timeseries_dataset.csv"
SEND_INTERVAL_SECONDS = 1 # How long to wait between sending each row

# --- Main Function ---
def simulate_patient_monitor(patient_id, data_df):
    """
    Loops through a patient's data and sends it to the API, one row at a time.
    """
    print(f"--- 🚀 Starting Simulation for {patient_id} ---")
    print(f"   Sending data to {API_URL}/{patient_id}")
    print(f"   (Press Ctrl+C to stop)")
    
    # Get just this patient's data
    patient_df = data_df[data_df['Patient_ID'] == patient_id].copy()
    
    if patient_df.empty:
        print(f"❌ Error: Could not find data for {patient_id} in {CSV_FILE}")
        return

    # These are the 17 features the API expects
    # We drop 'Patient_ID', 'time', and 'Target'
    vitals_columns = [col for col in patient_df.columns if col not in ['Patient_ID', 'time', 'Target']]

    try:
        # Loop through each row in the patient's dataframe
        for index, row in patient_df.iterrows():
            
            # 1. Convert the row to the correct JSON format
            # We use the original 'HR [bpm]' style names, 
            # since the Pydantic model is set up to alias them.
            vitals_payload = row[vitals_columns].to_dict()
            
            current_time_str = row['time'] # Get the time from the CSV
            
            print(f"\n--- {current_time_str} ---")
            print(f"Sending data: HR={vitals_payload.get('HR [bpm]')}, SpO2={vitals_payload.get('SpO2 [%]')}%")

            try:
                # 2. Send the POST request to the running server
                response = requests.post(
                    f"{API_URL}/{patient_id}",
                    json=vitals_payload
                )
                
                response.raise_for_status() # Raise an error for bad responses (4xx, 5xx)
                
                # 3. Print the server's response
                response_data = response.json()
                
                risk = response_data['risk_probability'] * 100
                status = response_data['status_message']
                
                print(f"✅ Server Response: {status}")
                
                if "Prediction" in status:
                    print(f"   📈 CURRENT RISK: {risk:.2f}%")
                    if response_data['predicted_class'] == 1:
                        print("   🚨 ALERT! HIGH RISK PREDICTED! 🚨")
                
            except requests.exceptions.ConnectionError:
                print("❌ Error: Could not connect to the API server.")
                print("   Is the `main.py` (uvicorn) server running?")
                break
            except requests.exceptions.RequestException as e:
                print(f"❌ Error during request: {e}")
                print(f"   Server details: {response.text}")

            # 4. Wait before sending the next row
            time.sleep(SEND_INTERVAL_SECONDS)

    except KeyboardInterrupt:
        print("\n--- 🛑 Simulation stopped by user. ---")

# --- Run the Script ---
if __name__ == "__main__":
    # 1. Install 'requests' library first:
    # pip install requests
    
    try:
        df = pd.read_csv(CSV_FILE)
    except FileNotFoundError:
        print(f"❌ Error: Cannot find dataset '{CSV_FILE}'")
        exit()
        
    simulate_patient_monitor(PATIENT_ID, df)