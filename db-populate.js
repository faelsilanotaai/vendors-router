// eslint-disable-next-line @typescript-eslint/no-var-requires
const mongoose = require('mongoose');

const mongoURI = 'mongodb://root:example@localhost:27017/admin';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const Vendor = mongoose.model('vendors', {
  name: String,
  weight: Number,
  status: Boolean,
});

async function cadastrarVendedores() {
  try {
    const vendorsData = [
      { name: 'Vendedor 1', weight: 2, status: true },
      { name: 'Vendedor 2', weight: 2, status: true },
      { name: 'Vendedor 3', weight: 1, status: true },
      { name: 'Vendedor 4', weight: 1, status: true },
      { name: 'Vendedor 5', weight: 1, status: true },
    ];

    const result = await Vendor.insertMany(vendorsData);
    console.log('Vendedores cadastrados com sucesso:', result);
  } catch (error) {
    console.error('Erro ao cadastrar vendedores:', error);
  } finally {
    mongoose.connection.close();
  }
}

cadastrarVendedores();
