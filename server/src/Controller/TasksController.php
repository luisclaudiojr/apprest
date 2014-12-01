<?php
namespace App\Controller;

use App\Controller\AppController;
use Cake\Event\Event;

/**
 * Tasks Controller
 *
 * @property App\Model\Table\TasksTable $Tasks
 */
class TasksController extends AppController {

    public function initialize(){
        parent::initialize();
        $this->layout = 'ajax';
    }

    public function beforeFilter(Event $event){
        parent::beforeFilter($event);

        $this->autoRender = false;
        $this->response->type('jsonp');
    }

    private function jsonp($data){
        if(isset($this->request->query['callback']))
            $this->response->body($this->request->query['callback'].'('.json_encode($data).')');
        else
            $this->response->body(json_encode($data));
    }

    public function all(){
        $today = $this->Tasks->find()
            ->hydrate(false)
            ->select([
                'id',
                'title',
                'description',
                'position',
                'checked',
                'date_format' => "DATE_FORMAT(date,'%d/%m/%Y')",
            ])
            ->where(['Tasks.date LIKE' => '%'.date('Y-m-d').'%'])
            ->where(['date >= DATE(NOW())'])
            ->orWhere(function($exp){
                return $exp->isNull('date');
            })
            ->order(['position'=>'ASC'])
            ->map(function($row){
                $row['date'] = $row['date_format'];
                unset($row['date_format']);
                return $row;
            })
            ->toArray(true);


        $all = $this->Tasks->find()
            ->select([
                'id',
                'title',
                'description',
                'checked',
                'position',
                'date_format' => "DATE_FORMAT(date,'%d/%m/%Y')",
                'name' => "DATE_FORMAT(date,'%Y%m%d')",
                'title_group' => "DATE_FORMAT(date,'%d/%m/%Y')",
            ])
            ->where(function($exp){
                return $exp->isNotNull('date');
            })
            ->where(['date >= DATE(NOW())'])
            ->order(['position'=>'ASC']);

        $groups = [];
        foreach ($all as $key => $value) {
            $groups[$value->name] = [
                'name' => $value->name,
                'title' => $value->title_group,
                'itens' => []
            ];
        }

        foreach ($all as $key => $value) {
            $groups[$value->name]['itens'][] = [
                'id' => $value->id,
                'title' => $value->title,
                'description' => $value->description,
                'date' => $value->date_format,
                'checked' => $value->checked,
                'position' => 1
            ];
        }

        sort($groups);

        $data = [
            'today' => $today,
            'all' => $groups,
        ];

        $this->jsonp($data);
    }

    public function save(){
        if(isset($this->request->query['all']))
            $this->saveAll($this->request->query['all']);

        if(isset($this->request->query['today']))
            $this->saveToday($this->request->query['today']);

        if(isset($this->request->query['remove']))
            $this->delete($this->request->query['remove']);

        $this->jsonp(true);
    }

    private function saveToday($today){
        foreach($today as $key => $value) {
            if(isset($value['date']) and $value['date'] > 0) {
                $value['date'] = array_reverse(explode('/',$value['date']));
                $value['date'] = [
                    'year' => $value['date'][0],
                    'month' => $value['date'][1],
                    'day' => $value['date'][2]
                ];
            }
            elseif(isset($value['date']))
                unset($value['date']);

            if(isset($value['id']) and $this->Tasks->find('all')->where(['id'=>$value['id']])->count() > 0){
                $task = $this->Tasks->get($value['id']);
                $task = $this->Tasks->patchEntity($task, $value);
            }
            else{

                $task = $this->Tasks->newEntity($value);
            }

            $this->Tasks->save($task);
        }

    }

    private function saveAll($all){
            foreach($all as $key => $valeu){
                $groupName = implode('',array_reverse(explode('/',$valeu['date'])));
                $groups[$groupName][] = $all[$key];
                ksort($groups[$groupName]);
            }

            foreach($groups as $k => $v){
                foreach($groups[$k] as $key => $value)
                    $groups[$k][$key]['position'] = $key + 1;
            }

            foreach($groups as $k => $v){
                foreach($groups[$k] as $item){
                    if(isset($item['date']) and $item['date'] > 0) {
                        $item['date'] = array_reverse(explode('/',$item['date']));
                        $item['date'] = [
                            'year' => $item['date'][0],
                            'month' => $item['date'][1],
                            'day' => $item['date'][2]
                        ];
                    }
                    elseif(isset($item['date']))
                        unset($item['date']);

//                    $item['checked'] = ($item['checked'] == 'true') ? 1 : 0;

                    if(isset($item['id']) and $this->Tasks->find('all')->where(['id'=>$item['id']])->count() > 0){
                        $task = $this->Tasks->get($item['id']);
                        $task = $this->Tasks->patchEntity($task, $item);
                    }
                    else{
                        $item['checked'] = 1;
                        $task = $this->Tasks->newEntity($item);
                    }

                    $this->Tasks->save($task);
                }

            }

    }

    private function delete($ids){

        foreach($ids as $key => $value){
            $this->request->allowMethod(['post', 'delete','get','ajax']);
            $task = $this->Tasks->get($value['id']);
            $this->Tasks->delete($task);
        }

    }

    public function lastId(){
        $lastId = $this->Tasks->find()
                    ->select('id')
                    ->order(['id'=>'DESC'])
                    ->first();


        echo $this->jsonp($lastId->id);
    }

}
