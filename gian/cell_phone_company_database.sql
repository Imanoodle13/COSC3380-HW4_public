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
  address		VARCHAR(50),
  calls_placed	INT,
  top_cust		BOOL
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
  tax		DECIMAL(5,2),
  cost		DECIMAL(15,2),
  paid		DECIMAL(15,2) 
);
