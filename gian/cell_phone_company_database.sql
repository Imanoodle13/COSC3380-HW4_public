---------- FUNCTIONS ---------------------------------------------
DROP FUNCTION IF EXISTS calculate_subtotal(INT);
DROP FUNCTION IF EXISTS calculate_discount(INT);
DROP FUNCTION IF EXISTS calculate_tax(INT);
DROP FUNCTION IF EXISTS calculate_cost(INT);

CREATE FUNCTION calculate_subtotal(c_id INT) RETURNS DECIMAL(15,2) AS $$
-- Calculates subtotal as a base to calulate for discount value and BILLING.tax.
DECLARE
	base_val	DECIMAL(3,2) := 0.83;	-- Base $/minute: ($0.83 per minute) 
	subtotal	DECIMAL(15,2):= (SELECT elapsed FROM CALL WHERE id = c_id) * base_val;
BEGIN
	RETURN subtotal;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION calculate_discount(c_id INT) RETURNS DECIMAL(15,2) AS $$
-- Calculates dollar value of discount for final cost.
DECLARE
	subtotal		DECIMAL(15,2) := calculate_subtotal(c_id);
	discount_imp	DECIMAL(5,2)  := (SELECT discount FROM PLAN_OPTION WHERE id = (SELECT plan_id FROM BILLING WHERE call_id = c_id)) / 100;
	discount_amt	DECIMAL(15,2) := subtotal * discount_imp;
BEGIN
	RETURN discount_amt;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION calculate_tax(c_id INT) RETURNS DECIMAL(15,2) AS $$
-- Calculates dollar value of tax for BILLING.tax.
DECLARE
	subtotal	DECIMAL(15,2) := calculate_subtotal(c_id);
	tax			DECIMAL(5,2)  := 0.1;
	tax_amt		DECIMAL(15,2) := subtotal * tax;
BEGIN
	RETURN tax_amt;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION calculate_cost(c_id INT) RETURNS DECIMAL(15,2) AS $$
-- Assumes discount and tax are of dollar value and not of percentage.
DECLARE
	subtotal	DECIMAL(15,2) := calculate_subtotal(c_id);
	discount	DECIMAL(15,2) := calculate_discount(c_id);
	tax			DECIMAL(15,2) := calculate_tax(c_id);
	total_cost	DECIMAL(15,2) := subtotal + tax - discount;
BEGIN
	RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

---------- RELATIONS ---------------------------------------------
DROP TABLE IF EXISTS customer		CASCADE;
DROP TABLE IF EXISTS plan_option	CASCADE;
DROP TABLE IF EXISTS call			CASCADE;
DROP TABLE IF EXISTS plan			CASCADE;
DROP TABLE IF EXISTS bank_info		CASCADE;
DROP TABLE IF EXISTS billing		CASCADE;

/*LV1*/
CREATE TABLE customer(
  phone			INT,			CONSTRAINT customer_pk PRIMARY KEY (phone), CONSTRAINT customer_pk_uq UNIQUE (phone),
  first_name	VARCHAR(100),
  last_name		VARCHAR(100),
  dob			DATE,
  address		VARCHAR(50)
);

CREATE TABLE plan_option(
  id		INT,			CONSTRAINT plan_option_pk PRIMARY KEY (id), CONSTRAINT plan_option_pk_uq UNIQUE (id),
  name		VARCHAR(25),
  discount	DECIMAL(5,2)  
);

/*LV2*/
CREATE TABLE call(
  id			INT,		CONSTRAINT call_pk PRIMARY KEY (id), CONSTRAINT call_pk_uq UNIQUE (id),
  phone			INT,		CONSTRAINT customer_fk FOREIGN KEY (phone) REFERENCES customer(phone),
  start_time	TIMESTAMP,
  end_time		TIMESTAMP,
  elapsed		INT
);

CREATE TABLE plan(
  phone		INT,	CONSTRAINT customer_fk FOREIGN KEY (phone) REFERENCES customer(phone), CONSTRAINT customer_fk_uq UNIQUE (phone),
  plan_id	INT,	CONSTRAINT plan_option_fk FOREIGN KEY (plan_id) REFERENCES plan_option(id)
);

CREATE TABLE bank_info(
  phone		INT,			CONSTRAINT customer_fk FOREIGN KEY (phone) REFERENCES customer(phone),
  card_id	INT,			CONSTRAINT bank_info_pk_uq UNIQUE(card_id),
  balance	DECIMAL(15,2)
);

/* LV3 */
CREATE TABLE billing(
  id		INT,			CONSTRAINT billing_pk PRIMARY KEY (id), CONSTRAINT billing_pk_uq UNIQUE (id),
  phone		INT,			CONSTRAINT customer_fk FOREIGN KEY (phone) REFERENCES customer(phone),
  call_id	INT,			CONSTRAINT call_fk FOREIGN KEY (call_id) REFERENCES call(id),
  plan_id	INT,			CONSTRAINT plan_option_fk FOREIGN KEY (plan_id) REFERENCES plan_option(id),
  card_id	INT,			CONSTRAINT bank_info_fk FOREIGN KEY (card_id) REFERENCES bank_info(card_id),
  subtotal	DECIMAL(15,2),
  discount	DECIMAL(15,2),
  tax		DECIMAL(15,2),
  cost		DECIMAL(15,2),
  paid		DECIMAL(15,2) 
);
