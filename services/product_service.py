from models.products_model import Product
from sqlalchemy import select
from sqlalchemy.orm import Session


_UPDATABLE_FIELDS = {"name", "price", "description", "banner_image", "quantity", "status"}


def create_product(product: Product, session: Session) -> Product:
	session.add(product)
	session.commit()
	session.refresh(product)
	return product


def get_product(product_id: int, session: Session) -> Product | None:
	return session.get(Product, product_id)


def get_all_products(session: Session, offset: int = 0, limit: int = 100) -> list[Product]:
	statement = select(Product).offset(offset).limit(limit)
	return list(session.scalars(statement).all())


def update_product(product_id: int, updates: dict[str, object], session: Session) -> Product | None:
	product = session.get(Product, product_id)
	if product is None:
		return None

	invalid_fields = updates.keys() - _UPDATABLE_FIELDS
	if invalid_fields:
		raise ValueError(f"Unsupported product fields: {', '.join(sorted(invalid_fields))}")

	for field, value in updates.items():
		setattr(product, field, value)

	session.commit()
	session.refresh(product)
	return product


def delete_product(product_id: int, session: Session) -> bool:
	product = session.get(Product, product_id)
	if product is None:
		return False

	session.delete(product)
	session.commit()
	return True
