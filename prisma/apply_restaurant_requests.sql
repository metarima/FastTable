-- Script para adicionar a tabela RestaurantRequest sem afetar dados existentes
-- Execute este script diretamente no seu banco de dados usando uma ferramenta SQL

-- Verificar se a tabela já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'RestaurantRequest') THEN
        -- CreateTable
        CREATE TABLE "RestaurantRequest" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "address" TEXT NOT NULL,
            "ownerName" TEXT,
            "ownerEmail" TEXT NOT NULL,
            "password" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "rejectionReason" TEXT,

            CONSTRAINT "RestaurantRequest_pkey" PRIMARY KEY ("id")
        );
        
        RAISE NOTICE 'Tabela RestaurantRequest criada com sucesso.';
    ELSE
        RAISE NOTICE 'Tabela RestaurantRequest já existe.';
    END IF;
END
$$; 