from datasets import load_dataset

dataset = load_dataset("Nicolybgs/healthcare_data", split="train")
print(dataset.column_names)
print(dataset[0])
