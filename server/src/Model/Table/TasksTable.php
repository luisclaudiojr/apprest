<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Tasks Model
 */
class TasksTable extends Table {

/**
 * Initialize method
 *
 * @param array $config The configuration for the Table.
 * @return void
 */
	public function initialize(array $config) {
		$this->table('tasks');
		$this->displayField('title');
		$this->primaryKey('id');
		$this->addBehavior('Timestamp');
	}

/**
 * Default validation rules.
 *
 * @param \Cake\Validation\Validator $validator instance
 * @return \Cake\Validation\Validator
 */
	public function validationDefault(Validator $validator) {
		$validator
			->add('id', 'valid', ['rule' => 'numeric'])
			->allowEmpty('id', 'create')
			->allowEmpty('title')
			->allowEmpty('description')
			->add('checked', 'valid', ['rule' => 'boolean'])
			->allowEmpty('checked')
			->add('date', 'valid', ['rule' => 'date'])
			->allowEmpty('date')
			->add('position', 'valid', ['rule' => 'numeric'])
			->allowEmpty('position');

		return $validator;
	}

}
