<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Task Entity.
 */
class Task extends Entity {

/**
 * Fields that can be mass assigned using newEntity() or patchEntity().
 *
 * @var array
 */
	protected $_accessible = [
		'title' => true,
		'description' => true,
		'checked' => true,
		'date' => true,
		'position' => true,
		'id' => true,
	];

}
