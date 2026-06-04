from database import engine, Base, User

print("Dropping old tables...")
Base.metadata.drop_all(bind=engine)

print("Creating new tables with the updated schema...")
Base.metadata.create_all(bind=engine)

print("Done! Database is ready.")