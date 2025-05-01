import sqlite3

#create data base and tables

conn = sqlite3.connect('creditos.db')
cursor = conn.cursor()
cursor.execute('''
CREATE TABLE IF NOT EXISTS creditos (
               id INTEGER PRIMARY KEY AUTOINCREMENT, cliente TEXT NOT NULL, monto REAL NOT NULL, 
               tasa_Interes REAL NOT NULL, plazo INTEGER NOT NULL, fecha_Otorgamiento TEXT NOT NULL)
''')

conn.commit()
conn.close ()