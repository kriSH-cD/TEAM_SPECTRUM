import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/MASTER_DF.csv")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "../data/synthetic_fine_tuned.csv")

def generate_synthetic_data():
    print(f"Loading real data from {DATA_PATH}...")
    if not os.path.exists(DATA_PATH):
        print("❌ Real data not found. Cannot fine-tune synthetic generation.")
        return

    df = pd.read_csv(DATA_PATH)
    
    # Identify numeric columns to model
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    print(f"Modeling based on columns: {list(numeric_cols)}")
    
    # Calculate statistics for "fine-tuning" the generation
    stats = {}
    for col in numeric_cols:
        stats[col] = {
            'mean': df[col].mean(),
            'std': df[col].std(),
            'min': df[col].min(),
            'max': df[col].max()
        }
    
    # Generate new synthetic data
    # We'll generate data for the next 365 days
    print("Generating synthetic data...")
    num_days = 365
    start_date = datetime.now()
    
    synthetic_data = []
    
    for i in range(num_days):
        date = start_date + timedelta(days=i)
        row = {'date': date}
        
        for col in numeric_cols:
            # Generate value based on real data distribution (Gaussian)
            # Add some random noise and trend
            base_val = np.random.normal(stats[col]['mean'], stats[col]['std'])
            
            # Add seasonality (weekly)
            day_factor = 1.0 + 0.1 * np.sin(2 * np.pi * date.weekday() / 7)
            
            val = base_val * day_factor
            
            # Clip to realistic range
            val = max(stats[col]['min'] * 0.8, min(stats[col]['max'] * 1.2, val))
            
            row[col] = val
            
        synthetic_data.append(row)
        
    syn_df = pd.DataFrame(synthetic_data)
    
    # Save
    syn_df.to_csv(OUTPUT_PATH, index=False)
    print(f"✅ Synthetic data generated and saved to {OUTPUT_PATH}")
    print(f"   - Rows: {len(syn_df)}")
    print(f"   - Columns: {len(syn_df.columns)}")
    print("   - This data is statistically 'fine-tuned' to match your real data.")

if __name__ == "__main__":
    generate_synthetic_data()
