CREATE EXTENSION btree_gist;

-- CreateTable
CREATE TABLE "container" (
    "id" BIGSERIAL NOT NULL,
    "parent_id" BIGINT,
    "type" VARCHAR(2) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "owner_id" INTEGER,
    "inherits_configuration" BOOLEAN DEFAULT true,
    "inherits_bioassays" BOOLEAN DEFAULT true,
    "config" JSONB,
    "metadata" JSONB,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_container_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "display_format" (
    "id" SERIAL NOT NULL,
    "locale" VARCHAR(100) NOT NULL,
    "number_format" VARCHAR(100) NOT NULL,
    "datetime_format" VARCHAR(100) NOT NULL,
    "description" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_display_format_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" SERIAL NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "version" BIGINT NOT NULL,
    "smiles_string" TEXT NOT NULL,
    "price_per_unit" DECIMAL,
    "unit_size" DECIMAL,
    "unit_of_measurement" VARCHAR(100),
    "stock_keeping_unit" VARCHAR(255),
    "vendor" VARCHAR(100),
    "in_stock" BOOLEAN NOT NULL,
    "last_synced_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "con_pk_inventory_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_metadata" (
    "id" SERIAL NOT NULL,
    "smiles_string" TEXT NOT NULL,
    "inchi_key" VARCHAR(27),
    "finger_print" BYTEA,
    "cas_number" VARCHAR(100),
    "link" TEXT,
    "source" CHAR(3) NOT NULL,
    "last_available_date" TIMESTAMPTZ(6),
    "last_synced_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "con_pk_inventory_metadata_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_job_order" (
    "lab_job_order_id" BIGSERIAL NOT NULL,
    "molecule_id" BIGINT NOT NULL,
    "pathway_id" BIGINT,
    "product_smiles_string" TEXT NOT NULL,
    "product_molecular_weight" DECIMAL,
    "no_of_steps" INTEGER,
    "functional_bioassays" JSONB,
    "reactions" JSONB,
    "file_path" TEXT,
    "status" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "submitted_at" TIMESTAMPTZ(6),
    "submitted_by" INTEGER,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_lab_job_order_id_mol_id" PRIMARY KEY ("lab_job_order_id","molecule_id")
);

-- CreateTable
CREATE TABLE "molecule" (
    "id" BIGSERIAL NOT NULL,
    "source_molecule_name" VARCHAR(150),
    "library_id" BIGINT NOT NULL,
    "project_id" BIGINT NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "smiles_string" TEXT NOT NULL,
    "inchi_key" VARCHAR(27),
    "molecular_weight" DECIMAL NOT NULL,
    "finger_print" BYTEA NOT NULL,
    "status" SMALLINT NOT NULL,
    "is_added_to_cart" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,
    "assays" JSONB,

    CONSTRAINT "con_pk_molecule_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "molecule_adme_data" (
    "id" BIGSERIAL NOT NULL,
    "lab_job_order_id" BIGINT NOT NULL,
    "molecule_id" BIGINT NOT NULL,
    "value" JSONB,
    "status" INTEGER NOT NULL,
    "last_synced_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "con_pk_molecule_adme_data_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "molecule_bio_data" (
    "id" BIGSERIAL NOT NULL,
    "lab_job_order_id" BIGINT NOT NULL,
    "molecule_id" BIGINT NOT NULL,
    "value" JSONB,
    "status" INTEGER NOT NULL,
    "last_synced_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "con_pk_molecule_bio_data_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "molecule_cart" (
    "id" BIGSERIAL NOT NULL,
    "molecule_order_id" INTEGER,
    "molecule_id" BIGINT NOT NULL,
    "library_id" BIGINT NOT NULL,
    "project_id" BIGINT NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "assays" JSONB,
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_molecule_cart_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "molecule_chem_data" (
    "id" BIGSERIAL NOT NULL,
    "lab_job_order_id" BIGINT NOT NULL,
    "molecule_id" BIGINT NOT NULL,
    "reaction_step_no" INTEGER NOT NULL,
    "value" JSONB,
    "status" INTEGER NOT NULL,
    "last_synced_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "con_pk_molecule_chem_data_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "molecule_order" (
    "id" SERIAL NOT NULL,
    "order_id" VARCHAR(100) NOT NULL,
    "order_name" VARCHAR(100) NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "ordered_molecules" INTEGER[],
    "synthesis_batch_submission" JSONB,
    "status" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_molecule_order_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_product_module" (
    "organization_id" BIGINT NOT NULL,
    "product_module_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_org_product_module_org_n_module" PRIMARY KEY ("organization_id","product_module_id")
);

-- CreateTable
CREATE TABLE "pathway" (
    "id" BIGSERIAL NOT NULL,
    "parent_id" BIGINT,
    "pathway_instance_id" SMALLINT NOT NULL DEFAULT 0,
    "pathway_index" SMALLINT,
    "pathway_score" DECIMAL,
    "step_count" SMALLINT,
    "molecule_id" BIGINT NOT NULL,
    "description" TEXT,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_pathway_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_module" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_product_module_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_module_action" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "product_module_id" INTEGER NOT NULL,
    "route" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_product_module_action_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_module_action_role_permission" (
    "id" SERIAL NOT NULL,
    "product_module_action_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "con_pk_prod_module_actn_role_perm_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reaction_compound" (
    "id" BIGSERIAL NOT NULL,
    "reaction_id" BIGINT NOT NULL,
    "compound_id" VARCHAR(30),
    "compound_label" VARCHAR(30),
    "compound_name" VARCHAR(100),
    "smiles_string" TEXT NOT NULL,
    "compound_type" CHAR(1),
    "role" VARCHAR(50),
    "molar_ratio" DECIMAL,
    "dispense_time" SMALLINT,
    "source" CHAR(2),
    "inventory_id" INTEGER,
    "inventory_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_reaction_compound_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reaction_detail" (
    "id" BIGSERIAL NOT NULL,
    "reaction_name" VARCHAR(100) NOT NULL,
    "reaction_template_id" INTEGER NOT NULL,
    "reaction_code" VARCHAR(10),
    "pathway_id" BIGINT NOT NULL,
    "reaction_sequence_no" SMALLINT,
    "confidence" DECIMAL,
    "reaction_smiles_string" TEXT,
    "temperature" DOUBLE PRECISION,
    "solvent" VARCHAR(50),
    "product_smiles_string" TEXT,
    "product_molecular_weight" DECIMAL,
    "product_type" CHAR(1),
    "status" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_reaction_detail_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reaction_template_master" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "template_group" VARCHAR(255) NOT NULL,
    "version" BIGINT NOT NULL,
    "chemical_1" VARCHAR(100),
    "chemical_2" VARCHAR(100),
    "chemical_3" VARCHAR(100),
    "chemical_4" VARCHAR(100),
    "chemical_5" VARCHAR(100),
    "chemical_6" VARCHAR(100),
    "no_of_components" INTEGER,
    "solvent" VARCHAR(255),
    "temperature" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_synced_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "con_pk_reaction_template_master_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "definition" TEXT,
    "type" VARCHAR(30) NOT NULL,
    "priority" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_role_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_code" (
    "id" SERIAL NOT NULL,
    "table_name" VARCHAR(100) NOT NULL,
    "column_name" VARCHAR(100) NOT NULL,
    "status_code" VARCHAR(10) NOT NULL,
    "status_name" VARCHAR(100) NOT NULL,
    "status_description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_status_code_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timezone" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "utc_offset" interval NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_timezone_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favourite_molecule" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "molecule_id" BIGINT NOT NULL,

    CONSTRAINT "con_pk_user_fav_molecule_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_user_role_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(25),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "email_id" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(256) NOT NULL,
    "timezone_id" INTEGER,
    "number_datetime_format_id" INTEGER,
    "image_url" VARCHAR(255),
    "organization_id" BIGINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,
    "primary_contact_id" INTEGER,

    CONSTRAINT "con_pk_user_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adme_parameter" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "reference" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_adme_parameter_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adme_parameter_detail" (
    "id" SERIAL NOT NULL,
    "adme_parameter_id" INTEGER NOT NULL,
    "color_class_name" VARCHAR(50) NOT NULL,
    "color_min_value" DECIMAL NOT NULL,
    "color_max_value" DECIMAL NOT NULL,
    "color_status" VARCHAR(50) NOT NULL,
    "formula_min_value" DECIMAL NOT NULL,
    "formula_max_value" DECIMAL NOT NULL,
    "formula" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_adme_parameter_detail_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container_access_permission" (
    "id" SERIAL NOT NULL,
    "container_id" BIGINT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "access_type" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_container_access_permission_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bioassay" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "target" VARCHAR(150),
    "clinical_indication" VARCHAR(150),
    "supplier_name" VARCHAR(100) NOT NULL,
    "stock_keeping_unit" VARCHAR(255),
    "user_fields" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" INTEGER,

    CONSTRAINT "con_pk_bioassay_id" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_container_is_active" ON "container"("is_active");

-- CreateIndex
CREATE INDEX "idx_container_owner_id" ON "container"("owner_id");

-- CreateIndex
CREATE INDEX "idx_container_parent_id" ON "container"("parent_id");

-- CreateIndex
CREATE INDEX "idx_container_type" ON "container"("type");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_container_type_and_name_and_parent_id" ON "container"("type", "name", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_display_format_locale" ON "display_format"("locale");

-- CreateIndex
CREATE INDEX "idx_display_format_is_active" ON "display_format"("is_active");

-- CreateIndex
CREATE INDEX "idx_inventory_in_stock" ON "inventory"("in_stock");

-- CreateIndex
CREATE INDEX "idx_inventory_smiles" ON "inventory" USING GIST ("smiles_string");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_inventory_id_n_version" ON "inventory"("id", "version");

-- CreateIndex
CREATE INDEX "idx_inventory_metadata_fingerprint" ON "inventory_metadata"("finger_print");

-- CreateIndex
CREATE INDEX "idx_inventory_metadata_smiles" ON "inventory_metadata" USING GIST ("smiles_string");

-- CreateIndex
CREATE INDEX "idx_inventory_metadata_source" ON "inventory_metadata"("source");

-- CreateIndex
CREATE INDEX "idx_lab_job_order_status" ON "lab_job_order"("status");

-- CreateIndex
CREATE INDEX "idx_molecule_fingerprint" ON "molecule"("finger_print");

-- CreateIndex
CREATE INDEX "idx_molecule_is_added_to_cart" ON "molecule"("is_added_to_cart");

-- CreateIndex
CREATE INDEX "idx_molecule_library_id" ON "molecule"("library_id");

-- CreateIndex
CREATE INDEX "idx_molecule_smiles" ON "molecule" USING GIST ("smiles_string");

-- CreateIndex
CREATE INDEX "idx_molecule_status" ON "molecule"("status");

-- CreateIndex
CREATE INDEX "idx_molecule_adme_data_status" ON "molecule_adme_data"("status");

-- CreateIndex
CREATE INDEX "idx_molecule_bio_data_status" ON "molecule_bio_data"("status");

-- CreateIndex
CREATE INDEX "idx_molecule_chem_data_status" ON "molecule_chem_data"("status");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_molecule_order_order_id" ON "molecule_order"("order_id");

-- CreateIndex
CREATE INDEX "idx_molecule_order_status" ON "molecule_order"("status");

-- CreateIndex
CREATE INDEX "idx_pathway_selected" ON "pathway"("selected");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_pathway_id_n_parent_id_n_instance_id" ON "pathway"("id", "parent_id", "pathway_instance_id");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_product_module_name" ON "product_module"("name");

-- CreateIndex
CREATE INDEX "idx_product_module_is_active" ON "product_module"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_prod_module_actn_role_perm" ON "product_module_action_role_permission"("product_module_action_id", "role_id");

-- CreateIndex
CREATE INDEX "idx_reaction_compound_compound_type" ON "reaction_compound"("compound_type");

-- CreateIndex
CREATE INDEX "idx_reaction_compound_smiles" ON "reaction_compound" USING GIST ("smiles_string");

-- CreateIndex
CREATE INDEX "idx_reaction_compound_source" ON "reaction_compound"("source");

-- CreateIndex
CREATE INDEX "idx_reaction_product_smiles" ON "reaction_detail" USING GIST ("product_smiles_string");

-- CreateIndex
CREATE INDEX "idx_reaction_product_type" ON "reaction_detail"("product_type");

-- CreateIndex
CREATE INDEX "idx_reaction_status" ON "reaction_detail"("status");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_reaction_template_name" ON "reaction_template_master"("name");

-- CreateIndex
CREATE INDEX "idx_reaction_template_master_is_active" ON "reaction_template_master"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_role_name" ON "role"("name");

-- CreateIndex
CREATE INDEX "idx_role_is_active" ON "role"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_status_code_tbl_n_col_status_cd_name" ON "status_code"("table_name", "column_name", "status_code", "status_name");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_timezone_name" ON "timezone"("name");

-- CreateIndex
CREATE INDEX "idx_timezone_is_active" ON "timezone"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_user_favourite_molecule" ON "user_favourite_molecule"("user_id", "molecule_id");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_user_email_id" ON "users"("email_id");

-- CreateIndex
CREATE INDEX "idx_user_is_active" ON "users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_adme_parameter_name" ON "adme_parameter"("name");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_adme_parameter_detail_param_id_n_color_class" ON "adme_parameter_detail"("adme_parameter_id", "color_class_name");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_container_access_permission_container_id_n_user_id" ON "container_access_permission"("container_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "con_uk_bioassay_name" ON "bioassay"("name");

-- AddForeignKey
ALTER TABLE "container" ADD CONSTRAINT "con_fk_container_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "container" ADD CONSTRAINT "con_fk_container_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "container" ADD CONSTRAINT "con_fk_container_parent_id" FOREIGN KEY ("parent_id") REFERENCES "container"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "container" ADD CONSTRAINT "con_fk_container_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "display_format" ADD CONSTRAINT "con_fk_display_format_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "display_format" ADD CONSTRAINT "con_fk_display_format_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "con_fk_inventory_metadata_inv_id" FOREIGN KEY ("inventory_id") REFERENCES "inventory_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lab_job_order" ADD CONSTRAINT "con_fk_lab_job_order_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lab_job_order" ADD CONSTRAINT "con_fk_lab_job_order_mol_id" FOREIGN KEY ("molecule_id") REFERENCES "molecule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lab_job_order" ADD CONSTRAINT "con_fk_lab_job_order_pathway_id" FOREIGN KEY ("pathway_id") REFERENCES "pathway"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lab_job_order" ADD CONSTRAINT "con_fk_lab_job_order_submit_by" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lab_job_order" ADD CONSTRAINT "con_fk_lab_job_order_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule" ADD CONSTRAINT "con_fk_molecule_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule" ADD CONSTRAINT "con_fk_molecule_library_id" FOREIGN KEY ("library_id") REFERENCES "container"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule" ADD CONSTRAINT "con_fk_molecule_org_id" FOREIGN KEY ("organization_id") REFERENCES "container"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule" ADD CONSTRAINT "con_fk_molecule_project_id" FOREIGN KEY ("project_id") REFERENCES "container"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule" ADD CONSTRAINT "con_fk_molecule_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_adme_data" ADD CONSTRAINT "con_fk_molecule_adme_data_lab_job_order_mol_id" FOREIGN KEY ("lab_job_order_id", "molecule_id") REFERENCES "lab_job_order"("lab_job_order_id", "molecule_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_adme_data" ADD CONSTRAINT "con_fk_molecule_adme_data_mol_id" FOREIGN KEY ("molecule_id") REFERENCES "molecule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_bio_data" ADD CONSTRAINT "con_fk_molecule_bio_data_lab_job_order_mol_id" FOREIGN KEY ("lab_job_order_id", "molecule_id") REFERENCES "lab_job_order"("lab_job_order_id", "molecule_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_bio_data" ADD CONSTRAINT "con_fk_molecule_bio_data_mol_id" FOREIGN KEY ("molecule_id") REFERENCES "molecule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_cart" ADD CONSTRAINT "con_fk_molecule_cart_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_cart" ADD CONSTRAINT "con_fk_molecule_cart_library_id" FOREIGN KEY ("library_id") REFERENCES "container"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_cart" ADD CONSTRAINT "con_fk_molecule_cart_mol_order_id" FOREIGN KEY ("molecule_order_id") REFERENCES "molecule_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_cart" ADD CONSTRAINT "con_fk_molecule_cart_molecule_id" FOREIGN KEY ("molecule_id") REFERENCES "molecule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_cart" ADD CONSTRAINT "con_fk_molecule_cart_org_id" FOREIGN KEY ("organization_id") REFERENCES "container"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_cart" ADD CONSTRAINT "con_fk_molecule_cart_project_id" FOREIGN KEY ("project_id") REFERENCES "container"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_cart" ADD CONSTRAINT "con_fk_molecule_cart_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_chem_data" ADD CONSTRAINT "con_fk_molecule_chem_data_lab_job_order_mol_id" FOREIGN KEY ("lab_job_order_id", "molecule_id") REFERENCES "lab_job_order"("lab_job_order_id", "molecule_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_chem_data" ADD CONSTRAINT "con_fk_molecule_chem_data_mol_id" FOREIGN KEY ("molecule_id") REFERENCES "molecule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_order" ADD CONSTRAINT "con_fk_molecule_order_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_order" ADD CONSTRAINT "con_fk_molecule_order_org_id" FOREIGN KEY ("organization_id") REFERENCES "container"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "molecule_order" ADD CONSTRAINT "con_fk_molecule_order_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "org_product_module" ADD CONSTRAINT "con_fk_org_product_module_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "org_product_module" ADD CONSTRAINT "con_fk_org_product_module_org_id" FOREIGN KEY ("organization_id") REFERENCES "container"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "org_product_module" ADD CONSTRAINT "con_fk_org_product_module_prod_module_id" FOREIGN KEY ("product_module_id") REFERENCES "product_module"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "org_product_module" ADD CONSTRAINT "con_fk_org_product_module_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pathway" ADD CONSTRAINT "con_fk_pathway_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pathway" ADD CONSTRAINT "con_fk_pathway_molecule_id" FOREIGN KEY ("molecule_id") REFERENCES "molecule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pathway" ADD CONSTRAINT "con_fk_pathway_parent_id" FOREIGN KEY ("parent_id") REFERENCES "pathway"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pathway" ADD CONSTRAINT "con_fk_pathway_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_module" ADD CONSTRAINT "con_fk_product_module_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_module" ADD CONSTRAINT "con_fk_product_module_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_module_action" ADD CONSTRAINT "con_fk_product_module_actn_created_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_module_action" ADD CONSTRAINT "con_fk_product_module_actn_module_id" FOREIGN KEY ("product_module_id") REFERENCES "product_module"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_module_action_role_permission" ADD CONSTRAINT "con_fk_product_module_actn_id" FOREIGN KEY ("product_module_action_id") REFERENCES "product_module_action"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_module_action_role_permission" ADD CONSTRAINT "con_fk_product_module_actn_role_id" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reaction_compound" ADD CONSTRAINT "con_fk_reaction_compound_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reaction_compound" ADD CONSTRAINT "con_fk_reaction_compound_inv_id" FOREIGN KEY ("inventory_id") REFERENCES "inventory_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reaction_compound" ADD CONSTRAINT "con_fk_reaction_compound_rxn_id" FOREIGN KEY ("reaction_id") REFERENCES "reaction_detail"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reaction_compound" ADD CONSTRAINT "con_fk_reaction_compound_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reaction_detail" ADD CONSTRAINT "con_fk_reaction_detail_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reaction_detail" ADD CONSTRAINT "con_fk_reaction_detail_rxn_template_id" FOREIGN KEY ("reaction_template_id") REFERENCES "reaction_template_master"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reaction_detail" ADD CONSTRAINT "con_fk_reaction_detail_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reaction_detail" ADD CONSTRAINT "con_fk_reaction_detail_pathway_id" FOREIGN KEY ("pathway_id") REFERENCES "pathway"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "con_fk_role_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "con_fk_role_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "status_code" ADD CONSTRAINT "con_fk_status_code_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "status_code" ADD CONSTRAINT "con_fk_status_code_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "timezone" ADD CONSTRAINT "con_fk_timezone_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "timezone" ADD CONSTRAINT "con_fk_timezone_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_favourite_molecule" ADD CONSTRAINT "con_fk_user_fav_molecule" FOREIGN KEY ("molecule_id") REFERENCES "molecule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_favourite_molecule" ADD CONSTRAINT "con_fk_user_fav_molecule_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "con_fk_user_role_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "con_fk_user_role_id" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "con_fk_user_role_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "con_fk_user_role_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "con_fk_user_display_format_id" FOREIGN KEY ("number_datetime_format_id") REFERENCES "display_format"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "con_fk_user_timezone_id" FOREIGN KEY ("timezone_id") REFERENCES "timezone"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "con_fk_users_org_id" FOREIGN KEY ("organization_id") REFERENCES "container"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "con_fk_users_primary_contact_id" FOREIGN KEY ("primary_contact_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adme_parameter" ADD CONSTRAINT "con_fk_adme_parameter_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "adme_parameter" ADD CONSTRAINT "con_fk_adme_parameter_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "adme_parameter_detail" ADD CONSTRAINT "con_fk_adme_parameter_detail_adme_parameter_id" FOREIGN KEY ("adme_parameter_id") REFERENCES "adme_parameter"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "adme_parameter_detail" ADD CONSTRAINT "con_fk_adme_parameter_detail_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "adme_parameter_detail" ADD CONSTRAINT "con_fk_adme_parameter_detail_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "container_access_permission" ADD CONSTRAINT "con_fk_container_access_permission_container_id" FOREIGN KEY ("container_id") REFERENCES "container"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "container_access_permission" ADD CONSTRAINT "con_fk_container_access_permission_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "container_access_permission" ADD CONSTRAINT "con_fk_container_access_permission_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "container_access_permission" ADD CONSTRAINT "con_fk_container_access_permission_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bioassay" ADD CONSTRAINT "con_fk_bioassay_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bioassay" ADD CONSTRAINT "con_fk_bioassay_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

